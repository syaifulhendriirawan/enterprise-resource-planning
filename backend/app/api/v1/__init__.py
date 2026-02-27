from fastapi import APIRouter

from app.api.v1 import auth, dashboard, inventory, sales, purchases, finance, reports

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
