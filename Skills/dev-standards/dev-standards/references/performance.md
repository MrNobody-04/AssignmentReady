# Performance Standards

Rule: set budgets first, measure, then optimize the biggest bottleneck. Never optimize by guessing.

## 1. Budgets (targets)

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | <= 2.5 s (p75, mobile) |
| INP (Interaction to Next Paint) | <= 200 ms |
| CLS (Cumulative Layout Shift) | <= 0.1 |
| TTFB | <= 800 ms (aim < 200 ms with CDN/edge) |
| Initial JS per route | <= 170 KB gzipped |
| Total page weight (landing) | <= 1.5 MB |
| API read p95 | < 300 ms |
| API write p95 | < 800 ms |
| DB query p95 | < 50 ms (hot paths) |
| Lighthouse (mobile) | Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+ |

## 2. Frontend

- SSR/SSG/ISR for content; streaming and Suspense for slow parts.
- Code-split routes and heavy widgets; lazy-load below-the-fold.
- Optimize images (AVIF/WebP, correct sizes, `priority` for the hero), SVG for icons, video with poster and `preload="none"`.
- Fonts: self-host, subset, limit weights, preload the primary.
- Remove render-blocking CSS/JS; inline critical CSS; defer third-party scripts.
- Avoid layout shift (dimensions on media, reserved space).
- Reduce main-thread work: avoid heavy effects, big JSON parsing, huge DOM (< 1500 nodes), long tasks (> 50ms); use workers for heavy compute.
- Virtualize large lists/tables; debounce inputs; memoize after profiling.
- Use `prefers-reduced-motion`; animate only `transform`/`opacity`.
- 3D/WebGL (Three.js, R3F): lazy-load, compress models (Draco/Meshopt, KTX2 textures), limit draw calls, pause when off-screen, provide a lightweight fallback for low-end devices.

## 3. Network and delivery

- CDN for static assets and edge caching; HTTP/2 or HTTP/3; Brotli.
- Immutable, hashed filenames with long `Cache-Control`; short TTL or revalidation for HTML.
- Preconnect to critical origins, prefetch likely next routes.
- Service worker/PWA caching where it makes sense.

## 4. Backend

- Find hotspots with profiling and tracing (OpenTelemetry, APM) before changing code.
- Cache expensive reads (Redis), with TTL and invalidation.
- Async/queue for slow tasks; stream large responses; paginate everything.
- Connection pooling; avoid blocking the event loop (Node) or the async loop (Python).
- Batch external calls; parallelize independent calls; timeouts on all outbound requests.
- Compression and efficient serialization.

## 5. Database

- Index for real query patterns; verify with `EXPLAIN ANALYZE`.
- Remove N+1; select only needed columns; keyset pagination.
- Materialized views / summary tables for heavy dashboard aggregates; refresh on schedule.
- Monitor slow query log (`pg_stat_statements`); vacuum/analyze healthy.
- Move reporting load to read replica or warehouse.

## 6. Measuring

- Lab: Lighthouse, WebPageTest, Chrome DevTools Performance, bundle analyzer.
- Field (real users): web-vitals library, Vercel Analytics / Speed Insights, CrUX, RUM.
- Load testing: k6, Artillery, Locust before launch; test realistic traffic and spikes.
- CI performance budgets (Lighthouse CI) fail the build on regression.
- Track p50/p95/p99, error rate, throughput, saturation (CPU, memory, DB connections).

## 7. Performance checklist per module

- [ ] No unnecessary re-renders or large dependencies added
- [ ] Bundle size delta checked
- [ ] Images/fonts optimized
- [ ] Queries have indexes; no N+1
- [ ] Lists paginated or virtualized
- [ ] Slow work offloaded
- [ ] Measured before/after for any optimization
