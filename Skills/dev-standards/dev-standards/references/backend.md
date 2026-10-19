# Backend Standards

## 1. Layering (per module)

```
controller  -> parse request, call service, shape response (no business logic)
service     -> business rules, orchestration, transactions, authorization checks
repository  -> database queries only
schema/dto  -> validation + typed input/output
```

- Controllers never import repositories. Services never import `req/res`.
- One module per domain (`users`, `orders`, `payments`). Cross-module calls go through the other module's service, not its repository.

## 2. Frameworks

| Language | Pick | Notes |
|---|---|---|
| TypeScript | NestJS | Built-in modules, DI, guards, pipes; matches 3-layer naturally |
| TypeScript (lightweight) | Fastify or Express + manual layering | Keep the same folder rules |
| Python | FastAPI | Pydantic validation, async, auto OpenAPI |
| Python (full) | Django + DRF | Batteries included |
| Java | Spring Boot | Enterprise |

## 3. Configuration

- All config from environment, parsed and validated at startup (Zod / Pydantic Settings). Fail fast if invalid.
- `.env.example` committed; real `.env` never.
- Separate dev / staging / prod; secrets from a secret manager in prod.

## 4. Error handling and logging

- One global error handler mapping domain errors to HTTP codes.
- Error format (consistent): `{ "error": { "code": "ORDER_NOT_FOUND", "message": "...", "details": [...], "requestId": "..." } }`
- Never leak stack traces or SQL errors to clients.
- Structured JSON logs (pino / structlog) with request ID, user ID, latency. No passwords, tokens or PII in logs.
- Error tracking (Sentry) and metrics (Prometheus / OpenTelemetry).

## 5. Business logic rules

- Validate all input at the edge with a schema; trust nothing from the client.
- Use database transactions for multi-step writes.
- Idempotency for payments and retried operations.
- Use enums/state machines for statuses (`pending -> paid -> shipped`), reject illegal transitions.
- Money in integer minor units (or Decimal), never floats.
- Store timestamps in UTC; convert at the edge.
- Soft delete only when business needs history; otherwise hard delete + audit log.

## 6. Background work

- Slow or retryable work goes to a queue (BullMQ, Celery, SQS): emails, reports, imports, AI calls, webhooks.
- Jobs are idempotent, retried with backoff, with dead-letter queue and monitoring.
- Scheduled jobs via cron / queue scheduler, single runner (locking).

## 7. Caching

- Cache reads that are expensive and tolerate staleness (Redis, TTL + explicit invalidation).
- Cache key includes tenant / user / version. Never cache per-user data in shared keys.
- HTTP caching headers (ETag, Cache-Control) for public GETs.

## 8. AI/LLM features (if used)

- Call models from the backend only; never expose API keys to the client.
- Timeouts, retries, token and cost limits, per-user rate limits.
- Treat model output as untrusted input: validate against schema, sanitize before rendering or executing.
- Guard against prompt injection when feeding user or web content to a model; give tools least privilege.
- Log prompts/outputs carefully (redact PII), keep evals for key prompts.

## 9. Testing (backend)

- Unit tests for services (mock repositories).
- Integration tests with a real test database (Testcontainers / docker-compose).
- Contract tests against OpenAPI.
- Cover auth, validation, permission, error paths; not only the happy path.
- Seed script for local dev.

## 10. Deployment

- Dockerfile (multi-stage, non-root user, minimal image), `docker-compose` for local.
- CI: lint -> type-check -> test -> build -> scan (dependencies, secrets) -> deploy.
- Migrations run as a separate, reviewed step; zero-downtime (expand/contract).
- Health + readiness endpoints; graceful shutdown; rollbacks possible.

## 11. Backend module checklist

- [ ] Controller / service / repository separated
- [ ] Input schema validation
- [ ] AuthN + AuthZ on every route (deny by default)
- [ ] Errors mapped, logged, consistent format
- [ ] Transactions where needed
- [ ] Pagination, filtering, sorting on lists
- [ ] Tests (unit + integration)
- [ ] OpenAPI updated
- [ ] No dead code or unused deps
