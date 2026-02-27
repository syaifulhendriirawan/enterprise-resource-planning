from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/sales")
async def get_sales_report(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    # Placeholder for more complex reporting
    return {"message": "Sales report stub"}

@router.get("/purchases")
async def get_purchases_report(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    return {"message": "Purchases report stub"}

@router.get("/inventory")
async def get_inventory_report(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    return {"message": "Inventory report stub"}
