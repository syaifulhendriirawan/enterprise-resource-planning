from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class CashAccount(Base):
    __tablename__ = "cash_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    type = Column(String(20)) # "cash", "bank", "ewallet"
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    description = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False) # "income", "expense"
    amount = Column(Float, nullable=False)
    cash_account_id = Column(Integer, ForeignKey("cash_accounts.id"), nullable=False)
    category = Column(String(50)) # e.g., "Operations", "Salary", "Sales", "Purchases"
    reference = Column(String(100)) # Order number/Receipt Number
    created_by = Column(Integer, ForeignKey("users.id"))
