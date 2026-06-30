# iPro Technologies — Used Laptops Store

Angular frontend + Node/Express backend for the iPro Technologies store in HSR Layout, Bengaluru.

## Quick start

**Backend** (port 3000):

```bash
cd backend
cp .env.example .env   # fill in MongoDB, JWT, Cloudinary
npm install
npm run seed
npm run dev
```

**Frontend** (port 4200):

```bash
npm install
npm start
```

- Store: `http://localhost:4200`
- Admin login: `http://localhost:4200/admin/login`

See [backend/README.md](./backend/README.md) for API setup, env vars, and npm scripts.

## Admin panel

| Section | Path | Purpose |
|---------|------|---------|
| Dashboard | `/admin/dashboard` | Overview |
| Products | `/admin/products` | Add/edit laptops |
| Inventory | `/admin/inventory` | Stock levels |
| Inquiries | `/admin/inquiries` | Customer leads |
| Reviews | `/admin/reviews` | Testimonials |
| Gallery | `/admin/gallery` | Store photos (Cloudinary) & YouTube videos |
| Account | `/admin/account` | Change password |

Gallery photos and YouTube links are managed in admin — no code changes needed when updating the website media.

## Password management

### Owner knows their password

**Admin → Account** — enter current password and set a new one.

### Owner forgot their password

They should contact the site administrator (you). **Their old password is never required for a reset.**

Support workflow:

1. Verify it's really the owner (phone, known contact, etc.)
2. On the server, run:

```bash
cd backend
npm run reset:admin-password
```

3. Share the temporary password printed in the terminal
4. Owner logs in → **Admin → Account** → sets a new password immediately

Full details (JWT expiry, optional flags, API endpoints): **[backend/README.md](./backend/README.md#password-management)**

## Build

```bash
npm run build
```

Output: `dist/laptop-marketplace/`

## Environment

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | Dev API URL |
| `src/environments/environment.prod.ts` | Production API URL |
| `backend/.env` | Secrets (never commit) |
