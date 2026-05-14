# Pulse — Local Setup

Real-time blood coordination platform: Spring Boot backend + Vite/React frontend + PostgreSQL.

## Prerequisites

- Java 17
- Node.js 18+
- PostgreSQL 14+ (running on `localhost:5432`)

## 1. PostgreSQL

The backend connects to database `pulsedb` as user `pulse` / password `pulse`.

```sh
# start postgres (macOS / Homebrew)
brew services start postgresql

# create the role + database (once)
psql -d postgres -c "CREATE USER pulse WITH PASSWORD 'pulse';"
psql -d postgres -c "CREATE DATABASE pulsedb OWNER pulse;"
```

Schema is created automatically by Hibernate (`spring.jpa.hibernate.ddl-auto=update`) on first boot — no migrations to run.

## 2. Run everything — `npm run dev`

Both the backend and frontend start together from the `frontend/` folder:

```sh
cd frontend
npm install      # first time only
npm run dev
```

This uses [`concurrently`](https://www.npmjs.com/package/concurrently) to launch both processes in one terminal:

- `[API]` (blue)  — Spring Boot backend on **http://localhost:8080**
- `[WEB]` (magenta) — Vite frontend on **http://localhost:5173**

`Ctrl+C` stops both. The backend takes a few seconds longer to boot than Vite — API calls fail gracefully into empty states until `[API]` logs `Started ... in Xs`.

### Running a side on its own

| Command            | Runs            |
|--------------------|-----------------|
| `npm run dev`      | backend + frontend |
| `npm run dev:web`  | frontend only (Vite) |
| `npm run dev:api`  | backend only (`./mvnw spring-boot:run`) |

REST API is under `/api`; WebSocket (SockJS + STOMP) is at `/ws`. API base is hardcoded to `http://localhost:8080/api` (`src/api/client.js`); CORS on the backend allows `http://localhost:5173`.

Production builds: `npm run build` (frontend) · `./mvnw package -DskipTests` (backend jar).

## Dev URLs

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8080/api    |
| WebSocket| http://localhost:8080/ws     |

## Test accounts

Created during integration smoke testing (all password `pass123`). Recreate them by registering through the UI or `POST /api/auth/register` if you reset the database.

| Role        | Email                  | Password | Notes                              |
|-------------|------------------------|----------|------------------------------------|
| DONOR       | donor1@pulse.test      | pass123  | O+, Kathmandu, available           |
| HOSPITAL    | hospital1@pulse.test   | pass123  | verified by admin during testing   |
| BLOOD_BANK  | bank1@pulse.test       | pass123  | verified by admin during testing   |
| ADMIN       | admin1@pulse.test      | pass123  | verified by default                |

Hospital and blood bank accounts register as `verified: false` and must be verified by an admin (`PATCH /api/admin/users/{id}/verify`) — done already for the accounts above.

## Smoke-test reference

Register → login → `GET /api/auth/me` returns `{user, profile}`. Hospital creates an `EMERGENCY` request → `Notification` rows are written and pushed over STOMP to `/topic/alerts/{userId}` for matching available donors and nearby blood banks. Donor responds → request moves `OPEN → MATCHED`.
