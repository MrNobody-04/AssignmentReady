# Database Standards

## 1. Choosing

- Default: **PostgreSQL** (relational, JSONB for flexible fields, full-text search, pgvector for embeddings).
- Add **Redis** for cache, sessions, queues, rate limits.
- MongoDB / DynamoDB only for clearly document- or key-shaped, high-scale data.
- Search at scale: Postgres FTS first, then Meilisearch / Typesense / Elasticsearch.
- Files: object storage (S3 / R2 / Supabase Storage), only URLs/keys in DB.

## 2. Schema design

- Model entities and relationships first (ERD); normalize to 3NF, denormalize only with measured need.
- Every table: `id` (UUID/ULID or bigint identity), `created_at`, `updated_at`; `deleted_at` only if soft delete is required.
- Constraints in the DB, not just in code: `NOT NULL`, `UNIQUE`, `CHECK`, foreign keys with explicit `ON DELETE`.
- Use proper types: `timestamptz`, `numeric` for money (or integer minor units), `enum`/lookup tables for statuses, `boolean`, `jsonb` sparingly.
- Naming: `snake_case`, plural tables, FK as `<entity>_id`.
- Multi-tenant apps: `tenant_id` on every tenant table + Row Level Security or enforced repository filter.
- Avoid: storing comma-separated lists, EAV tables, one giant "data" JSON column, nullable everything.

## 3. Indexing and queries

- Index every foreign key and every column used in frequent `WHERE`, `JOIN`, `ORDER BY`.
- Composite indexes ordered by equality columns first, then range/sort.
- Partial and covering indexes for hot queries.
- Verify with `EXPLAIN (ANALYZE, BUFFERS)`; fix seq scans on large tables.
- No `SELECT *` in application code; select needed columns.
- No N+1: join, batch (`WHERE id = ANY($1)`), or DataLoader.
- Pagination: keyset (cursor) for big tables, not deep `OFFSET`.
- Turn on `pg_stat_statements` and review slow queries regularly.
- Remove unused/duplicate indexes (they slow writes).

## 4. Migrations

- Every schema change is a versioned migration (Prisma Migrate, Drizzle Kit, Alembic, Flyway). Never edit prod by hand.
- Zero-downtime pattern (expand -> migrate -> contract): add nullable column -> backfill -> switch code -> add constraint -> drop old.
- Migrations are reviewed, tested on a copy of prod-like data, and reversible when possible.
- Seed scripts for dev; never seed fake data in prod.

## 5. Transactions and integrity

- Wrap multi-step writes in a transaction; keep them short.
- Use appropriate isolation; lock rows (`SELECT ... FOR UPDATE`) or optimistic versioning for concurrent updates.
- Idempotent writes via unique constraints.
- Use constraints to enforce invariants instead of "check first, insert later".

## 6. Scalability

- Connection pooling (PgBouncer / Prisma Accelerate / pool size tuned per instance).
- Read replicas for heavy reads; accept replication lag where safe.
- Partition very large tables (time-based) when they reach hundreds of millions of rows.
- Archive or purge old data on a schedule.
- Cache hot reads in Redis; invalidate on write.

## 7. Security

- Least-privilege DB users (app user cannot `DROP`, migrations user separate).
- Parameterized queries / ORM only; never string-concatenate SQL.
- Encrypt in transit (TLS) and at rest; encrypt sensitive columns (PII, tokens) where required.
- Hash passwords with Argon2id or bcrypt (never store plain or reversible).
- Backups: automated, encrypted, off-site, **restore tested** regularly; define RPO/RTO.
- Audit log for sensitive actions; never log secrets.
- Private network access only; no public DB ports.

## 8. Redis usage rules

- Namespaced keys (`app:env:entity:id`), always set TTL.
- Do not use as the only copy of important data.
- Rate limiting, sessions, queues, short-lived caches.

## 9. Database checklist

- [ ] ERD reviewed; constraints and FKs defined
- [ ] Indexes for all frequent filters/joins verified with EXPLAIN
- [ ] Migration reversible and tested
- [ ] No `SELECT *`, no N+1
- [ ] Least-privilege credentials, TLS on
- [ ] Backups + tested restore
- [ ] Unused tables/columns/indexes removed
