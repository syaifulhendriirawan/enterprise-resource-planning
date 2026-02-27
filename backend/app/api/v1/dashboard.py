from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.sales import SalesOrder
from app.models.purchases import PurchaseOrder
from app.models.inventory import Product
from app.models.finance import CashAccount
from app.schemas.dashboard import DashboardSummary, DashboardChart, LowStockItem

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    # Sales Today
    today = datetime.now().date()
    sales_result = await db.execute(
        select(func.sum(SalesOrder.total))
        .filter(func.date(SalesOrder.order_date) == today)
        .filter(SalesOrder.status != "cancelled")
    )
    sales_today = sales_result.scalar() or 0.0

    # Purchases This Month
    first_day_of_month = today.replace(day=1)
    purchases_result = await db.execute(
        select(func.sum(PurchaseOrder.total))
        .filter(func.date(PurchaseOrder.order_date) >= first_day_of_month)
        .filter(PurchaseOrder.status != "cancelled")
    )
    purchases_month = purchases_result.scalar() or 0.0

    # Low Stock Items Count
    low_stock_result = await db.execute(
        select(func.count(Product.id)).filter(Product.current_stock < Product.min_stock)
    )
    low_stock_items = low_stock_result.scalar() or 0

    # Total Cash Balance
    cash_result = await db.execute(
        select(func.sum(CashAccount.balance)).filter(CashAccount.is_active == True)
    )
    cash_balance = cash_result.scalar() or 0.0

    return {
        "sales_today": sales_today,
        "purchases_month": purchases_month,
        "low_stock_items": low_stock_items,
        "cash_balance": cash_balance
    }

@router.get("/low-stock", response_model=list[LowStockItem])
async def get_low_stock_items(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(Product)
        .filter(Product.current_stock < Product.min_stock)
        .limit(5)
    )
    products = result.scalars().all()
    return products

@router.get("/sales-chart", response_model=DashboardChart)
async def get_sales_chart(
    range: int = 30,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> Any:
    start_date = datetime.now() - timedelta(days=range)
    
    # Simple grouping by date
    # In a real app we might need to handle missing dates and fill with 0
    query = (
        select(
            func.date(SalesOrder.order_date).label("date"),
            func.sum(SalesOrder.total).label("sales")
        )
        .filter(SalesOrder.order_date >= start_date)
        .filter(SalesOrder.status != "cancelled")
        .group_by(func.date(SalesOrder.order_date))
        .order_by(func.date(SalesOrder.order_date))
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    data = [{"date": str(row.date), "sales": float(row.sales)} for row in rows]
    return {"data": data}
