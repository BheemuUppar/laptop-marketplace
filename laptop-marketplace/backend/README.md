# iPro Technologies - Backend API

Node.js + Express + MongoDB Atlas + JWT + Cloudinary

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — long random secret
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — initial admin credentials
   - `CLOUDINARY_*` — Cloudinary credentials for image uploads
   - `FRONTEND_URL` — `http://localhost:4200` for dev

2. Install and seed admin:
```bash
npm install
npm run seed
```

3. Start API:
```bash
npm run dev
```

API runs at `http://localhost:3000`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Admin login → JWT |
| GET | `/api/products` | No | Public product list |
| GET | `/api/products/slug/:slug` | No | Product by slug |
| GET | `/api/products/admin/all` | Yes | All products (admin) |
| POST | `/api/products` | Yes | Create product |
| PUT | `/api/products/:id` | Yes | Update product |
| PATCH | `/api/products/:id/mark-sold` | Yes | Decrement stock |
| PATCH | `/api/products/:id/toggle-availability` | Yes | Toggle listing |
| DELETE | `/api/products/:id` | Yes | Delete product |
| POST | `/api/inquiries` | No | Submit inquiry |
| GET | `/api/inquiries` | Yes | List inquiries |
| POST | `/api/upload` | Yes | Upload images (Cloudinary) |

## Database Collections

- **products** — laptop inventory (starts empty)
- **inquiries** — customer leads
- **adminusers** — JWT authentication

Inventory is empty by default. Add products through the admin panel.
