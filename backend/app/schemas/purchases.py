from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class SupplierBase(BaseModel):
    name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    name: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class PurchaseOrderItemBase(BaseModel):
    product_id: int
    qty: int
    unit_price: float

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    po_id: int
    subtotal: float
    model_config = {"from_attributes": True}

class PurchaseOrderBase(BaseModel):
    supplier_id: int
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderUpdateStatus(BaseModel):
    status: str

class PurchaseOrder(PurchaseOrderBase):
    id: int
    po_number: str
    order_date: datetime
    subtotal: float
    total: float
    status: str
    created_by: Optional[int] = None
    
    items: List[PurchaseOrderItem] = []
    supplier: Optional[Supplier] = None
    
    model_config = {"from_attributes": True}

class GoodsReceiptItemCreate(BaseModel):
    product_id: int
    qty_received: int

class GoodsReceiptCreate(BaseModel):
    notes: Optional[str] = None
    items: List[GoodsReceiptItemCreate]

class GoodsReceiptItem(GoodsReceiptItemCreate):
    id: int
    receipt_id: int
    model_config = {"from_attributes": True}

class GoodsReceipt(BaseModel):
    id: int
    po_id: int
    receipt_date: datetime
    notes: Optional[str] = None
    created_by: Optional[int] = None
    items: List[GoodsReceiptItem] = []
    
    model_config = {"from_attributes": True}
