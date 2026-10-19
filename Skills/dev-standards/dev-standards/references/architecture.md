# Architecture, Folders, Scalability

## 1. Three-layer architecture

```
Presentation  ->  Business Logic (Service)  ->  Data Access (Repository)  ->  Database
 (UI / API        (rules, workflows,           (queries only,
  controllers)     validation, auth checks)     no business rules)
```

Rules:
- A layer calls only the layer directly below it. UI never queries the DB. Controllers never contain business rules.
- Data shapes crossing layers are DTOs / typed schemas, not raw DB rows.
- Business logic has no knowledge of HTTP, frameworks or SQL (so it is testable and reusable).
- External services (email, payments, AI, storage) sit behind an interface (adapter) in the service layer.
- Dependencies point inward: swap Postgres or Stripe without touching business rules.

## 2. Standard folder structure

### Full-stack monorepo (recommended default)

```
project/
  apps/
    web/                    # Next.js (or Vite + React) frontend
      src/
        app/                # routes / pages only (thin)
        features/           # feature modules (see below)
        components/         # shared UI (ui/, layout/)
        lib/                # api client, utils, hooks
        styles/             # tokens.css, globals.css
        types/
      public/
    api/                    # backend service
      src/
        modules/            # one folder per domain module
          users/
            users.controller.ts
            users.service.ts
            users.repository.ts
            users.schema.ts      # validation + DTOs
            users.test.ts
        common/             # middleware, errors, guards, logger
        config/             # env parsing + validation
        db/                 # client, migrations, seeds
        main.ts
  packages/
    shared/                 # shared types, zod schemas, constants
    ui/                     # optional design system package
  docs/                     # README, ADRs, API docs
  scripts/
  .github/workflows/
  .env.example
  docker-compose.yml
```

### Frontend feature module

```
features/billing/
  components/    # feature-only components
  hooks/
  api.ts         # calls to backend
  schema.ts
  types.ts
  index.ts       # public exports only (other features import from here)
```

Rule: features never import from each other's internals, only from `index.ts`.

### Mobile (React Native / Expo or Flutter)

Same layering: `screens/` (presentation), `features/` + `services/` (logic), `data/` (API + local storage). Shared design tokens file.

## 3. Reusability levels

1. **Utility**: pure function in `lib/`.
2. **Component**: UI piece with props in `components/ui`.
3. **Feature module**: self-contained vertical slice.
4. **Package**: shared across apps in `packages/`.
5. **Skill / template**: reused across projects (this folder).

## 4. Scalability checklist

Design for horizontal scale from the start, even if you launch small.

- [ ] Stateless API servers (sessions in Redis or JWT, never in memory)
- [ ] Files in object storage (S3 / R2 / Supabase Storage), not on the server disk
- [ ] Database: indexes, connection pooling (PgBouncer), read replicas when needed
- [ ] Cache layer (Redis) for hot reads; CDN for static and edge-cacheable content
- [ ] Background jobs and queues for slow work (email, reports, AI calls) - BullMQ / Celery / SQS
- [ ] Pagination on every list endpoint (cursor-based for large sets)
- [ ] Idempotency keys on payment / create endpoints
- [ ] Rate limiting and request timeouts
- [ ] Health checks (`/health`, `/ready`) and graceful shutdown
- [ ] Structured logs, metrics, tracing (OpenTelemetry), error tracking (Sentry)
- [ ] Config via env, 12-factor, containerised (Docker)
- [ ] Feature flags for risky rollouts
- [ ] Modular monolith first; split into services only when a module has a clear independent scaling need

## 5. Choosing a stack (defaults, adjust per project)

| Layer | Default | Alternatives |
|---|---|---|
| Frontend web | Next.js + TypeScript + Tailwind + shadcn/ui | Vite + React, SvelteKit, Nuxt |
| State / data fetching | TanStack Query + Zustand | Redux Toolkit, SWR |
| Forms / validation | React Hook Form + Zod | Valibot |
| Backend | NestJS (TS) or FastAPI (Python) | Express + layered structure, Django, Spring Boot |
| ORM | Prisma or Drizzle (TS), SQLAlchemy (Py) | TypeORM |
| Database | PostgreSQL | MySQL, MongoDB (only for document-shaped data) |
| Cache / queue | Redis | RabbitMQ, SQS |
| Auth | Auth.js / Clerk / Supabase Auth / own JWT + refresh | Keycloak |
| Hosting | Vercel + Railway/Fly/Render, or Docker on a VPS | AWS, GCP |
| Mobile | React Native (Expo) or Flutter | Native |
| Testing | Vitest/Jest, Playwright, Pytest | Cypress |
| CI | GitHub Actions | GitLab CI |

Pick one stack per project and record the decision in `docs/decisions/`.
