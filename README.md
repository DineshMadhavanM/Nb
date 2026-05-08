# Nineteen06 — Premium Bakery Billing Dashboard

A luxury, SaaS-quality bakery management and POS system.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, GSAP, Recharts
- **Backend**: Node.js, Express, Prisma
- **Database**: SQLite (Default for easy setup) / PostgreSQL (Supported)

## Features
- **Luxury Aesthetic**: Cream, chocolate brown, and gold color palette with parallax scrolling and premium typography.
- **POS Billing**: Fast checkout modal with GST calculation and payment method selection.
- **Dashboard**: Real-time analytics and AI-powered sales prediction widgets.
- **Stock Management**: Inventory tracking with low-stock alerts.
- **Customer CRM**: Database with loyalty points tracking.
- **Invoices**: GST-compliant printable invoices.
- **Reports**: Detailed revenue and category breakdown charts.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   node prisma/seed.js
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Switching to PostgreSQL

1. Open `backend/prisma/schema.prisma` and change the provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `backend/.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/nineteen06?schema=public"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## Design Notes
- **Fonts**: Playfair Display (Luxury Headers), Inter (Clean UI).
- **Colors**:
  - Cream: `#F8F3EA`
  - Gold: `#C9993A`
  - Chocolate: `#2C1206`
- **Animations**: GSAP for landing page parallax, Framer Motion for dashboard transitions.
