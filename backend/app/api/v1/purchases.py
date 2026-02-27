from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.inventory import Product, StockMovement
from app.models.purchases import Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem
from app.schemas.purchases import (
    Supplier as SupplierSchema, SupplierCreate, SupplierUpdate,
    PurchaseOrder as PurchaseOrderSchema, PurchaseOrderCreate, PurchaseOrderUpdateStatus,
    GoodsReceiptCreate, GoodsReceipt as GoodsReceiptSchema
)

router = APIRouter()

#
# Suppliers
#
@router.get("/suppliers", response_model=List[SupplierSchema])
async def read_suppliers(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Supplier))
    return result.scalars().all()

@router.post("/suppliers", response_model=SupplierSchema)
async def create_supplier(
    supplier_in: SupplierCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    supplier = Supplier(**supplier_in.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier

#
# Purchase Orders
#
@router.get("/orders", response_model=List[PurchaseOrderSchema])
async def read_purchase_orders(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(PurchaseOrder)
        .options(selectinload(PurchaseOrder.supplier), selectinload(PurchaseOrder.items))
        .order_by(PurchaseOrder.order_date.desc())
    )
    return result.scalars().all()

@router.post("/orders", response_model=PurchaseOrderSchema)
async def create_purchase_order(
    order_in: PurchaseOrderCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    import time
    po_num = f"PO-{int(time.time())}"
    
    subtotal = 0.0
    for item in order_in.items:
        subtotal += item.unit_price * item.qty
        
    order = PurchaseOrder(
        po_number=po_num,
        supplier_id=order_in.supplier_id,
        notes=order_in.notes,
        subtotal=subtotal,
        total=subtotal,
        status="ordered",
        created_by=current_user.id
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    for item in order_in.items:
        item_subtotal = item.unit_price * item.qty
        order_item = PurchaseOrderItem(
            po_id=order.id,
            product_id=item.product_id,
            qty=item.qty,
            unit_price=item.unit_price,
            subtotal=item_subtotal
        )
        db.add(order_item)
            
    await db.commit()
    
    result = await db.execute(
        select(PurchaseOrder)
        .filter(PurchaseOrder.id == order.id)
        .options(selectinload(PurchaseOrder.supplier), selectinload(PurchaseOrder.items))
    )
    return result.scalars().first()

#
# Goods Receipts
#
@router.post("/orders/{po_id}/receive", response_model=GoodsReceiptSchema)
async def receive_goods(
    po_id: int,
    receipt_in: GoodsReceiptCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(PurchaseOrder).filter(PurchaseOrder.id == po_id))
    po = result.scalars().first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    receipt = GoodsReceipt(
        po_id=po.id,
        notes=receipt_in.notes,
        created_by=current_user.id
    )
    db.add(receipt)
    await db.commit()
    await db.refresh(receipt)
    
    for item in receipt_in.items:
        receipt_item = GoodsReceiptItem(
            receipt_id=receipt.id,
            product_id=item.product_id,
            qty_received=item.qty_received
        )
        db.add(receipt_item)
        
        # Add to inventory
        p_result = await db.execute(select(Product).filter(Product.id == item.product_id))
        product = p_result.scalars().first()
        if product:
            product.current_stock += item.qty_received
            
            movement = StockMovement(
                product_id=product.id,
                type="in",
                quantity=item.qty_received,
                reference_id=receipt.id,
                reference_type="purchase",
                notes=f"Received PO {po.po_number}",
                created_by=current_user.id
            )
            db.add(movement)
            
    # Mark PO as received
    po.status = "received"
    await db.commit()
    
    r_result = await db.execute(
        select(GoodsReceipt)
        .filter(GoodsReceipt.id == receipt.id)
        .options(selectinload(GoodsReceipt.items))
    )
    return r_result.scalars().first()
