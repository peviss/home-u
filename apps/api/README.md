# Home-U API

Express + TypeScript service for auth and property listings. Data access uses **Drizzle ORM** with **PostgreSQL**.

## Requirements

- Node.js 18+
- PostgreSQL

## Environment

Create a `.env` file in `apps/api` with at least `JWT_SECRET` and your database variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | **Yes** | Secret for signing JWTs. The process exits at startup if unset. |
| `DB_HOST` | For DB | PostgreSQL host |
| `DB_PORT` | No | Defaults to `5432` |
| `DB_USER` | For DB | Database user |
| `DB_PASSWORD` | For DB | Database password |
| `DB_NAME` | For DB | Database name |
| `PORT` | No | HTTP port (default `3000`) |
| `TRUST_PROXY` | No | Set to `1` or `true` when behind a reverse proxy so rate limiting uses the client IP correctly. |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run with nodemon + `ts-node` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm run seed` | Seed sample properties (`ts-node src/db/seed.ts`) |
| `npm run generate` | Drizzle Kit: generate SQL migrations |
| `npm run migrate` | Drizzle Kit: push schema to the database |

## Run locally

```bash
cd apps/api
npm install
# configure .env (JWT_SECRET + database)
npm run dev
```

Server logs the port it binds to (default `3000`).

## Base URL

All JSON routes are under `/api`.

## Rate limiting

- **Global:** 100 requests per 15 minutes per IP (applies to most routes).
- **Auth:** `/api/auth/login` and `/api/auth/register` are further limited to **30** requests per 15 minutes per IP.

## Authentication

Protected routes expect:

```http
Authorization: Bearer <jwt>
```

JWT payload includes `id`, `email`, and `role`. Roles used by this app: `user`, `agent`, `admin` (see seed/auth registration defaults).

## Endpoints

### Version

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/version` | No | `{ "version": "1.0.0" }` |

### Auth (`/api/auth`)

| Method | Path | Auth | Body (JSON) | Description |
|--------|------|------|---------------|-------------|
| POST | `/api/auth/register` | No | `email`, `password`, `fullName` | Creates user (default role `user`). Returns user without password. |
| POST | `/api/auth/login` | No | `email`, `password` | Returns `{ token, user }` (user without password). |

Validation errors and some auth failures return `{ "error": "<message>" }` with an appropriate status. Middleware-driven errors (for example invalid query) may return `{ "status": "error", "message": "<message>" }`.

### Properties (`/api/properties`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | Public | **List** properties with optional **filters** and **pagination** (query string validated). |
| GET | `/:id` | Public | **Get one** property by numeric `id`. |
| POST | `/` | `admin`, `agent` | **Create** (JSON body validated). |
| PUT | `/:id` | `admin`, `agent` | **Update** (partial fields allowed; same Zod schema as PATCH). |
| PATCH | `/:id` | `admin`, `agent` | Same as PUT. |
| DELETE | `/:id` | `admin` | **Delete** property. |

Invalid `id` returns `400` with `{ "error": "Invalid property id" }`. Missing row returns `404` with `{ "error": "Property not found" }`.

#### GET `/api/properties` — query parameters

All query params are optional unless noted. Invalid combinations (for example `minPrice` greater than `maxPrice`) return **400**.

| Parameter | Description |
|-----------|-------------|
| `q` | Search across title, description, city, and address (case-insensitive). |
| `city` | Substring match on city. |
| `state` | Two-letter US state code (normalized to uppercase). |
| `zipCode` | Exact ZIP match. |
| `minPrice`, `maxPrice` | Integer price range. |
| `minBedrooms`, `maxBedrooms` | Bedroom count range. |
| `minBathrooms`, `maxBathrooms` | Bathroom count range. |
| `minArea`, `maxArea` | Area range. |
| `isAvailable` | `true` or `false`. |
| `ownerId` | Filter by owner user id. |
| `page` | Page number (default `1`). |
| `pageSize` | Page size, max **100** (default `20`). |
| `sort` | `createdAt`, `price`, `area`, `title`, or `id` (default `createdAt`). |
| `order` | `asc` or `desc` (default `desc`). |

**Example**

```http
GET /api/properties?city=Miami&minPrice=500000&maxPrice=1000000&isAvailable=true&sort=price&order=asc&page=1&pageSize=20
```

**Response shape**

```json
{
  "items": [ /* property rows */ ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

When there are no rows, `total` is `0` and `totalPages` is `0`.

#### POST/PUT/PATCH body (properties)

Fields are validated with Zod (see `src/middleware/validate.ts`). Create requires full listing fields; updates accept any subset of:

`title`, `description`, `price`, `bedrooms`, `bathrooms`, `area`, `address`, `city`, `state`, `zipCode`, `isAvailable`, `ownerId`.

## Project layout

| Path | Role |
|------|------|
| `src/index.ts` | App bootstrap, middleware, route mounting |
| `src/routes/` | Route definitions |
| `src/controllers/` | HTTP handlers |
| `src/services/` | Business logic and database access |
| `src/db/schema.ts` | Drizzle table definitions |
| `src/middleware/` | Auth, validation, errors, rate limits |

## Legacy `v1` folder

`apps/api/v1` is an older variant of the API. The supported entrypoint for this package is **`src/index.ts`**.
