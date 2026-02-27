<div align="center">
  <img src="frontend/public/next.svg" alt="ERP System Logo" width="200"/>
  <br/>
  <h1>Enterprise Resource Planning (ERP) System</h1>
  <p>A modern, full-stack ERP web application built to streamline core business operations including Inventory, Sales, Purchasing, and Finance management.</p>
</div>

---

## 🚀 About the Project

This Enterprise Resource Planning (ERP) project is a comprehensive business management tool developed as a demonstration of robust full-stack software architecture. It offers real-time data flow between the frontend interface and the backend database, ensuring that sales correctly decrement inventory, purchases increment inventory, and all financial transactions directly impact journal accounts.

### Tech Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React & Tailwind CSS
- **Components**: shadcn/ui
- **State & Data**: Zustand & TanStack React Query
- **Charts**: Recharts

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy (Async)
- **Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens) & PassLib (Bcrypt)

---

## ✨ Key Features

1. **Dashboard Analytics**
   - Real-time summaries of Sales, Purchases, and Cash Balances.
   - Low-stock warning indicators and visual sales trend charts.
   
2. **Inventory Management**
   - Track products, categories, and stock limits.
   - Dynamic UI for adding and editing products directly on-page.

3. **Sales & Point of Sale (POS)**
   - Specialized pop-up massive UI dialogs for completing Point of Sale checkouts quickly without route changes.
   - Automatic deduction of stock quantities and registration of income to the financial journal.
   - Customer relationship tracking.

4. **Purchasing Module**
   - Intuitive screens for managing Supplier contracts and building Purchase Orders (PO).
   - "Receive Goods" feature that automatically registers incoming items to the warehouse.

5. **Finance & Accounting**
   - Manage Cash and Bank Accounts dynamically.
   - Track granular double-entry Journal Transactions for income (Sales) and expense (Purchasing).

---

## 🛠️ Getting Started

### Prerequisites

You need the following installed on your machine:
- Node.js (v18+)
- Python (3.11+)
- Docker (for PostgreSQL database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/syaifulhendriirawan/enterprise-resource-planning.git
   cd enterprise-resource-planning
   ```

2. **Start the Database**
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate # On Windows
   pip install -r requirements.txt
   
   # Run Migrations and Seed initial data
   alembic upgrade head
   python seed.py
   
   # Start the FastAPI server
   uvicorn app.main:app --reload --port 8000
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start the Next.js development server
   npm run dev
   ```

5. **Login Credentials** 
   - Open your browser at `http://localhost:3000`
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 👨‍💻 Developer & Author

**Syaiful Hendri**  
Passionate software engineer focused on building scalable, performant, and user-centric web applications. 

- GitHub: [@syaifulhendriirawan](https://github.com/syaifulhendriirawan)

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
