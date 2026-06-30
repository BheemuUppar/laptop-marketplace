# iPro Technologies - Backend API

Node.js + Express + MongoDB Atlas + JWT + Cloudinary

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — long random secret
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — initial admin credentials
   - `CLOUDINARY_URL` or `CLOUDINARY_*` — Cloudinary credentials for image uploads (recommended)
   - `FRONTEND_URL` — `http://localhost:4200` for dev

2. Install and seed admin:
```bash
npm install
npm run seed
```

3. Migrate existing local uploads to Cloudinary (after Cloudinary is configured):
```bash
npm run migrate:images
```

4. Start API:
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
| POST | `/api/upload` | Yes | Upload images (Cloudinary when configured, otherwise local disk) |

## Image storage

When Cloudinary env vars are set, new uploads go to `ipro-technologies/products` on Cloudinary and the returned `https://res.cloudinary.com/...` URLs are saved in MongoDB.

If Cloudinary is not configured, images are stored under `backend/uploads/products/` and served from `/uploads/products/`.

To move existing local product images into Cloudinary and update MongoDB URLs:

```bash
npm run migrate:images
```

## Database Collections

- **products** — laptop inventory (starts empty)
- **inquiries** — customer leads
- **adminusers** — JWT authentication

Inventory is empty by default. Add products through the admin panel.
