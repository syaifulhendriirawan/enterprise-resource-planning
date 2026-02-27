from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255))
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    buy_price = Column(Float, nullable=False, default=0.0)
    sell_price = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), default="pcs")
    min_stock = Column(Integer, default=5)
    current_stock = Column(Integer, default=0)
    image_path = Column(String(255))
    is_active = Column(Boolean, default=True)

    category = relationship("Category", back_populates="products")
    movements = relationship("StockMovement", back_populates="product")

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(String(20), nullable=False) # in, out, adjustment
    quantity = Column(Integer, nullable=False)
    reference_id = Column(Integer) # ID from sales_orders or purchase_orders
    reference_type = Column(String(50)) # "sales", "purchase", "manual"
    notes = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id")) # optional reference to users.id

    product = relationship("Product", back_populates="movements")
