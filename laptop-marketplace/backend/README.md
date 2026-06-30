# iPro Technologies - Backend API

Node.js + Express + MongoDB Atlas + JWT + Cloudinary

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — long random secret
   - `JWT_EXPIRES_IN` — token lifetime (default: `30m`)
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — initial admin credentials (used by `npm run seed` only)
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

## Admin login & JWT

- Admin login: frontend `/admin/login`
- Tokens expire after `JWT_EXPIRES_IN` (currently **30 minutes** in `.env`)
- Expired tokens return `401 Invalid or expired token` — log in again

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Admin login → JWT |
| POST | `/api/auth/change-password` | Yes | Change password (requires current password) |

## Password management

### Scenario 1: Owner knows current password

Use the admin panel — no server access needed:

1. Log in at `/admin/login`
2. Go to **Admin → Account**
3. Enter current password, new password, and confirm
4. Save

### Scenario 2: Owner forgot password (support reset)

**You never need their old password.**

When the store owner calls and says *"I forgot my password"*:

1. **Verify identity** — phone call, known email, or other check that it's really the account owner
2. **Run the reset script** from the `backend` folder:

```bash
npm run reset:admin-password
```

This will:
- Auto-generate a temporary password (e.g. `Temp@a3f9b2c1`)
- Hash it with bcrypt and save to MongoDB
- Set `mustChangePassword: true` on the account
- Print the username and temporary password in the terminal

3. **Share the temporary password** securely (phone, in person — avoid plain email if possible)
4. **Tell them to log in** and go to **Admin → Account** to set a new password immediately

**Optional:** set a specific temporary password instead of auto-generate:

```bash
npm run reset:admin-password -- --username bheema --password "Temp@12345"
```

**Optional:** use `ADMIN_PASSWORD` from `.env`:

```bash
npm run reset:admin-password -- --use-env
```

### What happens after a support reset

1. Owner logs in with the **temporary** password
2. They are redirected to **Account** (not Dashboard)
3. Other admin pages are blocked until they change the password
4. After they set a new password, full admin access is restored

### Owner-facing messages

- Login page: *"Forgot your password? Contact your site administrator…"*
- Account page: same guidance — owners should contact you, not run server commands

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
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
| GET | `/api/store/media` | No | Public gallery photos & YouTube videos |
| GET/POST/PUT/DELETE | `/api/admin/store/media/*` | Yes | Manage gallery & videos |
| GET/POST/PUT/DELETE | `/api/admin/reviews/*` | Yes | Manage customer reviews |
| GET | `/api/masters` | No | All active master dropdown values (grouped) |
| GET | `/api/masters/:type` | No | Active masters for one type |
| GET/POST/PUT/PATCH/DELETE | `/api/admin/masters/*` | Yes | Manage master data (soft delete) |

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API with file watch |
| `npm run seed` | Create initial admin user (if missing) |
| `npm run reset:admin-password` | Emergency password reset (no old password needed) |
| `npm run seed:products` | Seed sample products |
| `npm run seed:masters` | Seed default dropdown values (brands, processors, RAM, etc.) |
| `npm run migrate:images` | Upload local product images to Cloudinary |

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
- **adminusers** — JWT authentication (includes `mustChangePassword` flag)
- **storemedia** — gallery photos and YouTube videos
- **storesettings** — YouTube channel URL
- **reviews** — customer testimonials

Inventory is empty by default. Add products through the admin panel.
