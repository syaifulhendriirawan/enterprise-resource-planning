from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.inventory import Product, StockMovement
from app.models.sales import Customer, SalesOrder, SalesOrderItem
from app.schemas.sales import (
    Customer as CustomerSchema, CustomerCreate, CustomerUpdate,
    SalesOrder as SalesOrderSchema, SalesOrderCreate, SalesOrderUpdateStatus
)

router = APIRouter()

#
# Customers
#
@router.get("/customers", response_model=List[CustomerSchema])
async def read_customers(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Customer))
    return result.scalars().all()

@router.post("/customers", response_model=CustomerSchema)
async def create_customer(
    customer_in: CustomerCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer

#
# Sales Orders
#
@router.get("/orders", response_model=List[SalesOrderSchema])
async def read_sales_orders(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(SalesOrder)
        .options(selectinload(SalesOrder.customer), selectinload(SalesOrder.items))
        .order_by(SalesOrder.order_date.desc())
    )
    return result.scalars().all()

@router.post("/orders", response_model=SalesOrderSchema)
async def create_sales_order(
    order_in: SalesOrderCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    # Generate simple order number
    import time
    order_num = f"SO-{int(time.time())}"
    
    # Calculate totals
    subtotal = 0.0
    for item in order_in.items:
        # Fetch actual product price, but we trust the input for now for simplicity
        # Real app should fetch prices from db
        subtotal += item.unit_price * item.qty - item.discount
        
    total = subtotal - order_in.discount
    
    order = SalesOrder(
        order_number=order_num,
        customer_id=order_in.customer_id,
        notes=order_in.notes,
        discount=order_in.discount,
        subtotal=subtotal,
        total=total,
        status="paid", # Simple POS immediately marks as paid
        created_by=current_user.id
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    # Process items and inventory
    for item in order_in.items:
        item_subtotal = (item.unit_price * item.qty) - item.discount
        order_item = SalesOrderItem(
            order_id=order.id,
            product_id=item.product_id,
            qty=item.qty,
            unit_price=item.unit_price,
            discount=item.discount,
            subtotal=item_subtotal
        )
        db.add(order_item)
        
        # Deduct stock
        result = await db.execute(select(Product).filter(Product.id == item.product_id))
        product = result.scalars().first()
        if product:
            product.current_stock -= item.qty
            # Log movement
            movement = StockMovement(
                product_id=product.id,
                type="out",
                quantity=-item.qty,
                reference_id=order.id,
                reference_type="sales",
                notes=f"Sold via POS {order.order_number}",
                created_by=current_user.id
            )
            db.add(movement)
            
    await db.commit()
    
    # Fetch again to include items
    result = await db.execute(
        select(SalesOrder)
        .filter(SalesOrder.id == order.id)
        .options(selectinload(SalesOrder.customer), selectinload(SalesOrder.items))
    )
    return result.scalars().first()
