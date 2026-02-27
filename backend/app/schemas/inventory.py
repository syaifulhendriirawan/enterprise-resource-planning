from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

#
# Category
#
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None

class Category(CategoryBase):
    id: int
    model_config = {"from_attributes": True}

#
# Product
#
class ProductBase(BaseModel):
    sku: str
    name: str
    category_id: Optional[int] = None
    buy_price: float = 0.0
    sell_price: float = 0.0
    unit: str = "pcs"
    min_stock: int = 5
    image_path: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    sku: Optional[str] = None
    name: Optional[str] = None

class Product(ProductBase):
    id: int
    current_stock: int
    category: Optional[Category] = None
    model_config = {"from_attributes": True}

#
# Stock Movement
#
class StockMovementBase(BaseModel):
    product_id: int
    type: str # in, out, adjustment
    quantity: int
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    notes: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    pass

class StockMovement(StockMovementBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
    product: Optional[Product] = None
    model_config = {"from_attributes": True}
    
class StockAdjustment(BaseModel):
    product_id: int
    quantity: int  # positive to add, negative to subtract
    notes: Optional[str] = None
