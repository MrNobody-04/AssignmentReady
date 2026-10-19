# API Standards

## 1. Design

- Resource-oriented REST: nouns, plural, hierarchical (`/v1/users/{id}/orders`). Verbs via HTTP methods.
- Version in the path (`/v1`). Never break a version; add fields, deprecate with notice.
- Use GraphQL or tRPC only when the client needs flexible queries or end-to-end types; otherwise REST + OpenAPI.
- Contract first: write the OpenAPI spec (or shared Zod schema), then implement and generate clients/types.

## 2. Methods and status codes

| Action | Method | Success | Common errors |
|---|---|---|---|
| List | GET | 200 | 401, 403 |
| Read | GET | 200 | 404 |
| Create | POST | 201 + `Location` | 400/422, 409 |
| Replace | PUT | 200/204 | 404 |
| Partial update | PATCH | 200 | 400/422, 404 |
| Delete | DELETE | 204 | 404 |

Also: 400 malformed, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 validation, 429 rate limited, 500 server, 503 unavailable.

## 3. Requests and responses

- JSON, `camelCase` fields, ISO 8601 UTC timestamps, string IDs (UUID/ULID).
- Consistent envelope for lists: `{ "data": [...], "meta": { "nextCursor": "...", "total": 120 } }`.
- Same error shape everywhere (see `backend.md`).
- Pagination on every list: cursor-based preferred; enforce max `limit` (e.g. 100).
- Filtering, sorting, field selection via query params (`?status=paid&sort=-createdAt&fields=id,total`).
- Never return internal fields (password hashes, internal IDs, secrets).

## 4. Safety and reliability

- Auth on every endpoint (Bearer JWT / session cookie); deny by default.
- Rate limit per IP and per user/key; stricter on login, OTP, password reset.
- Request size limits, timeouts, CORS allowlist (never `*` with credentials).
- Idempotency-Key header on POST for payments/orders.
- Webhooks: verify signatures, handle retries, respond fast, process async.
- Validate and sanitize all params, headers, bodies, file uploads (type, size, content sniffing).

## 5. Performance

- Avoid N+1: eager load / batch / DataLoader.
- Gzip/Brotli, HTTP/2, ETag + conditional requests, `Cache-Control` for public data.
- Return only needed fields; avoid huge nested payloads.
- Heavy work async: return `202 Accepted` + job status endpoint.
- Target p95 latency < 300ms for reads, < 800ms for writes (excluding async jobs).

## 6. Documentation and DX

- OpenAPI served at `/docs` (Swagger UI / Scalar / Redoc); examples for every endpoint.
- Generate typed client (openapi-typescript, orval) for the frontend; no hand-written fetch types.
- Changelog for API changes; deprecation headers (`Deprecation`, `Sunset`).

## 7. Consuming third-party APIs

- Wrap each in an adapter with timeouts, retries (exponential backoff + jitter), circuit breaker.
- Keys in env/secret manager; never in the frontend.
- Cache and respect rate limits; log failures with correlation ID.
- Map external errors to your own error codes.

## 8. API checklist

- [ ] OpenAPI updated and validated
- [ ] AuthN/AuthZ tested (including other users' IDs: IDOR check)
- [ ] Validation + consistent errors
- [ ] Pagination + limits
- [ ] Rate limit + CORS configured
- [ ] No N+1, indexes exist for filters
- [ ] Integration tests for success and failure paths
