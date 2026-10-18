# Stock Opname API

A REST API for managing stores, products, store stock, users, and stock opname sessions. The API is built with Express and TypeScript, and uses PostgreSQL through Prisma ORM.

## Requirements

- Node.js and npm
- PostgreSQL

## Technologies

- Node.js, TypeScript, and Express 5
- PostgreSQL and Prisma ORM
- Zod for request validation
- JSON Web Tokens and bcryptjs for authentication
- Swagger UI and an OpenAPI 3 specification
- Helmet, CORS, and Morgan middleware

## Project structure

```text
.
├── openapi.json                 # OpenAPI specification
├── src/
│   ├── app.ts                   # Express application and Swagger UI
│   ├── server.ts                # HTTP server startup and shutdown
│   ├── config/                  # Environment and Prisma configuration
│   ├── constants/               # Shared roles and stock-opname values
│   ├── middlewares/             # Authentication, validation, and error handling
│   ├── modules/                 # Feature modules (routes, controllers, services, etc.)
│   │   ├── auth/
│   │   ├── product/
│   │   ├── stock-opname/
│   │   ├── store/
│   │   ├── store-stock/
│   │   └── user/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Seed entry point
│   │   ├── seeders/             # User, store, product, and stock seed data
│   │   └── migrations/          # Database migration history
│   ├── routes/                  # API route registration
│   ├── types/                   # Shared TypeScript types
│   └── utils/                   # Shared errors, responses, and token/password helpers
├── package.json
└── tsconfig.json
```

## Configuration

Copy `.env.example` to `.env`, then set the values for your environment. The example includes the required `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` variables. Use strong, unique JWT secrets outside local development.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
PORT=3000
NODE_ENV=development
```

`DATABASE_URL` is required by Prisma. `PORT` defaults to `3000`, and `NODE_ENV` defaults to `development`.

## Install dependencies

```bash
npm install
```

## Database migrations

Apply the existing migrations to your development database:

```bash
npm run prisma:migrate
```

This runs `prisma migrate dev` using the schema at `src/prisma/schema.prisma`. When you change the Prisma schema during development, this command creates and applies a migration.

To apply already-created migrations in a deployment environment, use:

```bash
npm run prisma:deploy
```

Generate the Prisma Client when needed:

```bash
npm run prisma:generate
```

## Seed the database

After configuring the database and applying migrations, run:

```bash
npx prisma db seed
```

The seed script creates or updates sample users, stores, products, and store stock. It is safe to rerun: users, stores, and products are upserted, and duplicate store-stock records are skipped.

The development seed includes these sample accounts:

| Username | Password |
| --- | --- |
| `owner` | `owner` |
| `manager` | `manager` |
| `staff` | `staff` |

These credentials are for local development only. Change or remove them before using seeded data in any shared or production environment.

## Run the application

Start the development server with automatic restarts:

```bash
npm run dev
```

The API is then available at `http://localhost:3000/api/v1` (or the port configured through `PORT`).

Build and start the compiled application:

```bash
npm run build
npm start
```

## API documentation

With the application running, open Swagger UI at:

```text
http://localhost:3000/api-docs
```

The API base path is `/api/v1`. The OpenAPI specification is maintained in `openapi.json`.