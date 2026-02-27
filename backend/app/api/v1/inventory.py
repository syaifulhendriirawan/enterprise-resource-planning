from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.inventory import Product, Category, StockMovement
from app.schemas.inventory import (
    Product as ProductSchema, ProductCreate, ProductUpdate,
    Category as CategorySchema, CategoryCreate, CategoryUpdate,
    StockMovement as StockMovementSchema, StockAdjustment
)

router = APIRouter()

#
# Categories
#
@router.get("/categories", response_model=List[CategorySchema])
async def read_categories(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Category))
    return result.scalars().all()

@router.post("/categories", response_model=CategorySchema)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    category = Category(**category_in.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

#
# Products
#
@router.get("/products", response_model=List[ProductSchema])
async def read_products(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Product))
    return result.scalars().all()

@router.post("/products", response_model=ProductSchema)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    product = Product(**product_in.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.get("/products/{id}", response_model=ProductSchema)
async def read_product(
    id: int,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Product).filter(Product.id == id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{id}", response_model=ProductSchema)
async def update_product(
    id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Product).filter(Product.id == id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
        
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/products/{id}")
async def delete_product(
    id: int,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Product).filter(Product.id == id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.is_active = False
    await db.commit()
    return {"message": "Product deactivated successfully"}

#
# Stock Adjustments
#
@router.post("/stock/adjustment", response_model=StockMovementSchema)
async def adjust_stock(
    adjustment: StockAdjustment,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(Product).filter(Product.id == adjustment.product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    movement_type = "in" if adjustment.quantity > 0 else "out"
    
    movement = StockMovement(
        product_id=product.id,
        type="adjustment",
        quantity=adjustment.quantity,
        reference_type="manual",
        notes=adjustment.notes,
        created_by=current_user.id
    )
    
    product.current_stock += adjustment.quantity
    
    db.add(movement)
    await db.commit()
    await db.refresh(movement)
    return movement

@router.get("/products/{id}/stock-movements", response_model=List[StockMovementSchema])
async def read_stock_movements(
    id: int,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(StockMovement).filter(StockMovement.product_id == id))
    return result.scalars().all()
