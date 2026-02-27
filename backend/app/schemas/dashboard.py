from typing import List, Optional
from pydantic import BaseModel

class DashboardSummary(BaseModel):
    sales_today: float
    purchases_month: float
    low_stock_items: int
    cash_balance: float

class ChartDataPoint(BaseModel):
    date: str
    sales: float

class DashboardChart(BaseModel):
    data: List[ChartDataPoint]

class LowStockItem(BaseModel):
    id: int
    name: str
    sku: str
    current_stock: int
    min_stock: int
