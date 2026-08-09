# Farmly  Grocery Delivery Platform

A full-stack grocery delivery platform: React 19 + Vite + Tailwind on the
frontend, Node.js/Express + PostgreSQL on the backend.

> **Status:** Landing page (frontend) is complete and production-styled.
> Backend has working auth, product, category, order/checkout, address,
> coupon, and admin-analytics APIs against a full PostgreSQL schema.
> Admin dashboard UI, delivery-partner dashboard UI, and the customer
> cart/checkout screens are not yet built — see "What's left" below.

---

## 1. Project structure

```
/client                  React 19 + Vite + Tailwind frontend
  /src
    /components/ui        Reusable UI (ProductCard, CategoryCard, RatingStars, ...)
    /components/layout     Navbar, Footer
    /pages/home             Landing page sections
    /pages/{auth,dashboard,admin,delivery,cart,profile,orders}  (scaffolded, mostly empty)
    /context, /hooks, /services, /utils, /routes, /constants, /styles

/server                  Node.js + Express backend
  /controllers            Route handlers (auth, product, order, category, coupon, admin, address)
  /routes                 Express routers
  /models                 Raw-SQL data access layer (pg)
  /middleware             auth, validation, error handling, rate limiting, uploads
  /config                 db.js (pg pool), cloudinary.js
  /services               email.service.js (Nodemailer), payment.service.js (Stripe)
  /jobs                   inngest.client.js (background jobs: order emails)
  /validators              express-validator chains
  server.js               App entry point

/database
  /schema/schema.sql      Full PostgreSQL schema (15 tables)
  /seed/seed.js           Seeds categories, sample products, admin user, a coupon

/docs                     (reserved for API docs / architecture notes)
```

## 2. Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, React Query, Axios, React Hook Form, Framer Motion, SwiperJS, Chart.js, react-icons |
| Backend | Node.js, Express |
| Database | PostgreSQL (raw SQL via `pg`, no ORM) |
| Auth | JWT (httpOnly cookie + Bearer header), bcryptjs |
| Images | Cloudinary |
| Email | Nodemailer |
| Background jobs | Inngest |
| Payments | Stripe |

## 3. Getting started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local, or a free [Neon](https://neon.tech) instance)

### Database
```bash
psql "$DATABASE_URL" -f database/schema/schema.sql
node database/seed/seed.js   # seeds sample data + admin@farmly.app / Admin@12345
```

### Backend
```bash
cd server
cp .env.example .env         # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npm run dev                  # http://localhost:5000
```

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```

## 4. Environment variables

See `server/.env.example` and `client/.env.example` for the full list.
Minimum to run locally: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (server) and
`VITE_API_BASE_URL` (client). Stripe, Cloudinary, and SMTP are optional for
local development — features that need them degrade gracefully (e.g. emails
are skipped with a console warning if SMTP isn't configured).

## 5. API overview

Base URL: `/api/v1`

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password/:token` |
| Products | `GET /products` (search/filter/sort/paginate), `GET /products/:id`, `POST/PUT/DELETE /products` (admin) |
| Categories | `GET /categories`, `POST/PUT/DELETE /categories` (admin) |
| Orders | `POST /orders/checkout`, `GET /orders/my-orders`, `GET /orders/:id`, `GET /orders` (admin), `PATCH /orders/:id/status`, `PATCH /orders/:id/assign` |
| Addresses | `GET/POST/DELETE /addresses` |
| Coupons | `POST /coupons/validate`, `GET/POST /coupons` (admin) |
| Admin | `GET /admin/dashboard` (revenue, sales trend, low stock, recent orders) |

All protected routes require `Authorization: Bearer <token>` (or the
`token` httpOnly cookie set on login). Admin-only routes additionally check
`role = 'admin'` via the `authorize()` middleware.

## 6. Database schema

15 tables: `users`, `addresses`, `categories`, `products`, `inventory_logs`,
`coupons`, `delivery_partners`, `orders`, `order_items`, `payments`,
`reviews`, `wishlist_items`, `notifications`, `activity_logs`, plus
`updated_at` triggers. Order placement runs inside a single DB transaction
(order + order_items + stock decrement + activity log) so partial writes
can't happen. Full DDL in `database/schema/schema.sql`.

## 7. Security

- `helmet` for HTTP headers, `cors` locked to `CLIENT_URL`
- `express-rate-limit` (general API + a stricter limiter on auth routes)
- `bcryptjs` password hashing (12 rounds), JWT with expiry
- `express-validator` on all write endpoints
- Parameterized SQL everywhere (no string-concatenated queries) — protects against SQL injection
- Centralized error handler that never leaks stack traces outside development

## 8. Deployment targets

- **Frontend:** Vercel (`client/`, `npm run build` → `dist/`)
- **Backend:** Render / Railway (`server/`, `npm start`)
- **Database:** Neon PostgreSQL
- Set the same environment variables from `.env.example` in each platform's dashboard.

## 9. What's left

This is a large brief; the following are scaffolded (folders exist) but not
yet built out:
- Customer-facing cart, checkout, and profile/order-history screens
- Admin dashboard UI (charts, product/order/coupon management tables)
- Delivery partner dashboard UI (accept/reject, live map, earnings)
- OTP verification flow
- Wishlist, reviews, and notifications UI
- Google Maps live tracking integration
- PWA/offline support

Each of these is a self-contained follow-up — the API and schema already
support most of them (reviews, wishlist, notifications, and delivery_partners
tables and, in several cases, endpoints already exist).
