# Backend API (MongoDB Atlas + Multi-tenant)

## Features
- Multi-user authentication (email/password)
- Multi-tenant isolation by company
- Roles: `company_admin`, `employee`
- Invite flow for adding employees
- Expense CRUD with tenant-safe access control

## Setup
1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI` and `JWT_SECRET`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

## Important
- Do not place MongoDB credentials in the mobile app.
- Keep all database access in this backend only.

## Endpoints
- `POST /api/auth/register-company`
- `POST /api/auth/login`
- `POST /api/auth/accept-invite`
- `GET /api/auth/me`
- `GET /api/users` (admin)
- `POST /api/users/invite` (admin)
- `POST /api/expenses`
- `GET /api/expenses?period=YYYY-MM`
- `DELETE /api/expenses/:id`
