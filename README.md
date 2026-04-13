# Smokey's QR System

A table-based digital platform for restaurants. Customers scan a QR code to request service, view the menu, leave reviews, and engage with promotions. Staff manage requests in real time. Admin controls operations and marketing.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed the database with sample data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Accounts

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@smokeys.com  | admin123 |
| Staff | staff@smokeys.com  | staff123 |

## Routes

| Path              | Description                     |
|-------------------|---------------------------------|
| `/`               | Home page                       |
| `/scan/[tableId]` | Customer QR experience          |
| `/staff`          | Staff dashboard (real-time)     |
| `/admin`          | Admin panel                     |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + SQLite (dev) / PostgreSQL (prod)
- **Server-Sent Events** for real-time updates
- **NextAuth.js** for authentication

## PRD Coverage

- **V2 (Master)**: QR scan, service requests, reviews, contact capture, staff dashboard, admin panel — fully implemented
- **V3**: Ordering, POS, KDS — architecture ready, not yet implemented
- **V4**: AI layer — architecture ready, not yet implemented

## Project Structure

```
src/
├── app/
│   ├── scan/[tableId]/    # Customer QR experience
│   ├── staff/             # Staff dashboard
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/
│   ├── customer/          # Customer UI components
│   ├── staff/             # Staff dashboard components
│   └── admin/             # Admin panel components
├── lib/                   # Utilities, auth, db, SSE
└── types/                 # TypeScript types
```
