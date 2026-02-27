from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    orders = relationship("SalesOrder", back_populates="customer")

class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True) # Optional for walk-in
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    subtotal = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), default="draft") # draft, unpaid, partial, paid, cancelled
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))

    customer = relationship("Customer", back_populates="orders")
    items = relationship("SalesOrderItem", back_populates="order")

class SalesOrderItem(Base):
    __tablename__ = "sales_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    qty = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    subtotal = Column(Float, nullable=False)

    order = relationship("SalesOrder", back_populates="items")
