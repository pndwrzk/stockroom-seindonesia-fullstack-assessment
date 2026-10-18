# Stockroom

Run the web app, API, and PostgreSQL with Docker Compose.

## Start

Make sure `stockroom-api/.env` contains `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, and `stockroom-web/.env` sets `NEXT_PUBLIC_API_URL=http://localhost:3000`.

```bash
docker compose up --build
```

- Web: http://localhost:3001
- API: http://localhost:3000/api/v1
- API docs: http://localhost:3000/api-docs

The web app is published on host port `3001`, and the API on host port `3000`. PostgreSQL listens on container port `5432` and is not published to the host. The API applies the database schema and runs the seed before starting.

## Seeded Login Accounts

| Username | Password | Role |
| --- | --- | --- |
| `owner` | `owner` | Owner |
| `manager` | `manager` | Manager |
| `staff` | `staff` | Staff |

These are development accounts created by the seeder.

## Run Locally

To run the API and web app locally with Node.js and npm, or to read their individual setup instructions and specifications, see:

- [API setup and specifications](./stockroom-api/README.md)
- [Web setup and specifications](./stockroom-web/README.md)

When running the apps locally, the API defaults to port `3000` and the web app uses port `3001` for both development (`npm run dev`) and production (`npm start`). Set `NEXT_PUBLIC_API_URL=http://localhost:3000` in `stockroom-web/.env` so the web app can reach the API.

## Stop

```bash
docker compose down
```

To also delete the database data:

```bash
docker compose down --volumes
```
