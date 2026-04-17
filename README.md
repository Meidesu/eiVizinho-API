# Ei Vizinho! — API

A community alert platform API where neighbours can report and share local incidents — think potholes, flooding, suspicious activity, power outages, and anything else worth flagging to the people nearby.

Built with [AdonisJS v6](https://adonisjs.com/) and PostgreSQL.

## Features

- User registration and authentication (token-based, via CPF or e-mail)
- Password reset flow with e-mail delivery
- Alert creation with categories, geolocation (reverse geocoding), and media attachments
- Media storage via local filesystem or Google Cloud Storage
- Real-time alert broadcasting via SSE (Server-Sent Events) with `@adonisjs/transmit`
- Auto-generated Swagger UI at `/docs`

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 |
| Framework | AdonisJS v6 |
| Language | TypeScript |
| Database | PostgreSQL (via Lucid ORM) |
| Auth | Token-based (`DbAccessTokensProvider`) |
| Storage | Local FS / Google Cloud Storage |
| Geocoding | Google Maps + OpenCage |
| Real-time | AdonisJS Transmit (SSE) |
| Validation | VineJS |
| API Docs | adonis-autoswagger |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd eiVizinho-API
   pnpm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in the required values:

   | Variable | Description |
   |---|---|
   | `APP_KEY` | AdonisJS application secret (generate with `node ace generate:key`) |
   | `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` | PostgreSQL connection |
   | `GOOGLE_MAPS_API_KEY` | Google Maps API key for reverse geocoding |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD` | SMTP credentials for e-mail delivery |
   | `GCS_BUCKET` / `GCS_KEY_FILENAME` | Google Cloud Storage (only if `DRIVE_DISK=gcs`) |
   | `TOKEN_EXPIRATION_IN_STRING` | Token lifetime, e.g. `4w` |
   | `FILE_SIZE_LIMIT_IN_MB` | Max upload size, e.g. `250mb` |

3. **Start the database**

   ```bash
   docker compose up -d
   ```

4. **Run migrations**

   ```bash
   node ace migration:run
   ```

5. **Start the dev server**

   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:3333`. The Swagger UI is at `http://localhost:3333/docs`.

## API Overview

### Public Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate with e-mail or CPF |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/password/reset/request` | Request a password reset e-mail |
| `GET` | `/auth/password/reset/validate/:token` | Validate a reset token |
| `POST` | `/auth/password/reset/:token` | Reset the password |
| `GET` | `/alerts` | List all alerts |
| `GET` | `/alert_category` | List all alert categories |

### Authenticated Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/user/data` | Get the authenticated user's profile |
| `POST` | `/alerts` | Create an alert (with media upload) |
| `GET` | `/alerts/:id` | Get an alert by ID |
| `PUT` | `/alerts/:id` | Update an alert |
| `DELETE` | `/alerts/:id` | Delete an alert |
| `POST` | `/alert_category` | Create an alert category |

Full request/response schemas are documented in the Swagger UI at `/docs`.

## Running with Docker

A multi-stage `Dockerfile` is included. To build and run the production image:

```bash
docker build -t eivizinho-api .
docker run -p 8080:8080 --env-file .env eivizinho-api
```

## Development Scripts

```bash
pnpm dev        # Start dev server with hot-reload
pnpm build      # Compile TypeScript to JS
pnpm start      # Start compiled production server
pnpm test       # Run test suites
pnpm lint       # Lint the codebase
pnpm format     # Format with Prettier
pnpm typecheck  # Type-check without emitting
```
