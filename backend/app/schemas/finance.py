from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class CashAccountBase(BaseModel):
    name: str
    type: str # cash, bank, ewallet
    is_active: bool = True

class CashAccountCreate(CashAccountBase):
    pass

class CashAccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = None

class CashAccount(CashAccountBase):
    id: int
    balance: float
    model_config = {"from_attributes": True}

class JournalEntryBase(BaseModel):
    description: str
    type: str # income, expense
    amount: float
    cash_account_id: int
    category: Optional[str] = None
    reference: Optional[str] = None

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntry(JournalEntryBase):
    id: int
    date: datetime
    created_by: Optional[int] = None
    model_config = {"from_attributes": True}

class FinanceSummary(BaseModel):
    total_balance: float
    total_receivables: float
    total_payables: float
