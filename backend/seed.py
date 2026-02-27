import asyncio
import logging
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.inventory import Category
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    async with AsyncSessionLocal() as db:
        logger.info("Checking for existing admin user...")
        # Check if admin already exists
        # In a real app we'd query this correctly, but for this simple seeder
        # we can just attempt to add and ignore integrity errors, or carefully check.
        # But we'll do an async query properly:
        from sqlalchemy.future import select
        
        result = await db.execute(select(User).filter(User.username == "admin"))
        admin_user = result.scalars().first()
        
        if not admin_user:
            logger.info("Creating default admin user...")
            new_admin = User(
                username="admin",
                email="admin@erp.local",
                password_hash=get_password_hash("admin123"), # Default from PRD
                full_name="System Administrator",
                role="owner"
            )
            db.add(new_admin)
            
            logger.info("Creating default categories...")
            demo_categories = [
                Category(name="Electronics", description="Devices and gadgets"),
                Category(name="Furniture", description="Home and office furniture"),
                Category(name="Groceries", description="Daily consumable goods"),
            ]
            for cat in demo_categories:
                db.add(cat)
                
            await db.commit()
            logger.info("Seed data successfully inserted.")
        else:
            logger.info("Database already seeded. Skipping.")

async def main():
    logger.info("Starting seed process...")
    await seed_data()
    logger.info("Finished seed process.")

if __name__ == "__main__":
    asyncio.run(main())
