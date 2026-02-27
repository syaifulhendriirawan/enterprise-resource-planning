from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    name: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class SalesOrderItemBase(BaseModel):
    product_id: int
    qty: int
    unit_price: float
    discount: float = 0.0

class SalesOrderItemCreate(SalesOrderItemBase):
    pass

class SalesOrderItem(SalesOrderItemBase):
    id: int
    order_id: int
    subtotal: float
    
    # We might want product details here, but let's keep it simple
    model_config = {"from_attributes": True}

class SalesOrderBase(BaseModel):
    customer_id: Optional[int] = None
    notes: Optional[str] = None
    discount: float = 0.0

class SalesOrderCreate(SalesOrderBase):
    items: List[SalesOrderItemCreate]

class SalesOrderUpdateStatus(BaseModel):
    status: str

class SalesOrder(SalesOrderBase):
    id: int
    order_number: str
    order_date: datetime
    subtotal: float
    total: float
    status: str
    created_by: Optional[int] = None
    
    items: List[SalesOrderItem] = []
    customer: Optional[Customer] = None
    
    model_config = {"from_attributes": True}

class PaymentCreate(BaseModel):
    amount: float
    payment_method: str = "cash"
    cash_account_id: int
    notes: Optional[str] = None
