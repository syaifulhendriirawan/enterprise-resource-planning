from app.core.database import Base

# Import all models here so Alembic can find them automatically
from app.models.user import User
from app.models.inventory import Category, Product, StockMovement
from app.models.sales import Customer, SalesOrder, SalesOrderItem
from app.models.purchases import Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem
from app.models.finance import CashAccount, JournalEntry
