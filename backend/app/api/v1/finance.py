from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.finance import CashAccount, JournalEntry
from app.schemas.finance import (
    CashAccount as CashAccountSchema, CashAccountCreate, CashAccountUpdate,
    JournalEntry as JournalEntrySchema, JournalEntryCreate, FinanceSummary
)

router = APIRouter()

#
# Cash Accounts
#
@router.get("/accounts", response_model=List[CashAccountSchema])
async def read_accounts(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(CashAccount))
    return result.scalars().all()

@router.post("/accounts", response_model=CashAccountSchema)
async def create_account(
    account_in: CashAccountCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    account = CashAccount(**account_in.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account

@router.put("/accounts/{id}", response_model=CashAccountSchema)
async def update_account(
    id: int,
    account_in: CashAccountUpdate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(select(CashAccount).filter(CashAccount.id == id))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    update_data = account_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)
        
    await db.commit()
    await db.refresh(account)
    return account

#
# Journal Entries
#
@router.get("/transactions", response_model=List[JournalEntrySchema])
async def read_transactions(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(JournalEntry).order_by(JournalEntry.date.desc())
    )
    return result.scalars().all()

@router.post("/transactions", response_model=JournalEntrySchema)
async def create_transaction(
    tx_in: JournalEntryCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    # Verify account
    result = await db.execute(select(CashAccount).filter(CashAccount.id == tx_in.cash_account_id))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Cash account not found")
        
    tx = JournalEntry(
        **tx_in.model_dump(),
        created_by=current_user.id
    )
    db.add(tx)
    
    # Update account balance
    if tx_in.type == "income":
        account.balance += tx_in.amount
    elif tx_in.type == "expense":
        account.balance -= tx_in.amount
        
    await db.commit()
    await db.refresh(tx)
    return tx

@router.get("/summary", response_model=FinanceSummary)
async def get_finance_summary(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    # Total Cash Balance
    cash_result = await db.execute(
        select(func.sum(CashAccount.balance)).filter(CashAccount.is_active == True)
    )
    total_balance = cash_result.scalar() or 0.0
    
    # In a full ERP we would calculate actual receivables/payables 
    # based on unpaid invoices/bills. We'll stub it here for simplicity.
    total_receivables = 0.0
    total_payables = 0.0
    
    return {
        "total_balance": total_balance,
        "total_receivables": total_receivables,
        "total_payables": total_payables
    }
