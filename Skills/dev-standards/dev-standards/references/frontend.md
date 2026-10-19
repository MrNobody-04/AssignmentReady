# Frontend Standards

## 1. Stack defaults

- TypeScript strict, React (Next.js App Router) or SvelteKit/Nuxt if chosen.
- Tailwind CSS mapped to design tokens + Radix/shadcn primitives.
- Data: TanStack Query for server state; Zustand/Context for small client state. No global store for server data.
- Forms: React Hook Form + Zod, shared schema with backend where possible.
- Routing/data loading on the server where possible (RSC, loaders), client JS only where interactive.

## 2. Structure and components

- Pages are thin: compose features, no business logic.
- Feature-first folders (`features/`), shared UI in `components/ui`.
- Components: small, typed props, single purpose, no fetching inside presentational components.
- Custom hooks hold logic (`useCart`, `useDebounce`); components render.
- Prefer composition (children, slots) over giant prop lists.
- Never copy a component to tweak it; add a variant.

## 3. State and data

- Source of truth on the server; cache with TanStack Query (keys, stale time, invalidation).
- Optimistic updates for fast-feeling mutations with rollback.
- URL is state for filters, tabs, pagination, search (shareable, back-button safe).
- Every async view handles: loading (skeleton), empty, error (with retry), success, partial.
- Debounce search, cancel stale requests (AbortController).

## 4. Forms and validation

- Validate on client for UX AND on server for security.
- Inline errors, preserved input, focus first error, disable submit while pending, prevent double submit.
- Correct input types, `autocomplete`, `inputmode`.

## 5. Error handling

- Error boundaries per route and critical widget.
- User-friendly messages; log details to Sentry. Never show stack traces.
- Network offline and timeout states.

## 6. Performance (frontend)

Budgets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 (p75 mobile), initial JS <= 170KB gzipped per route.

- Server render / static generate what you can; stream the rest.
- Code-split by route and heavy components (`dynamic import`).
- Images: AVIF/WebP, `width/height` or `aspect-ratio`, `loading="lazy"` below the fold, priority for the LCP image, responsive `srcset`.
- Fonts: self-host, subset, preload critical, `font-display: swap`.
- Avoid layout shift: reserve space for images, ads, embeds, skeletons.
- Virtualize long lists (TanStack Virtual). Memoize only after measuring.
- Third-party scripts: defer, load on interaction, audit regularly.
- Remove unused dependencies; analyze bundle (`@next/bundle-analyzer`, `source-map-explorer`).
- Cache static assets with immutable hashes, serve via CDN, enable Brotli.

## 7. Responsive and cross-browser

- Mobile-first CSS; container queries for components.
- Test Chrome, Safari (iOS), Firefox. Use `dvh` instead of `vh` on mobile.
- PWA basics when relevant: manifest, service worker, offline fallback.

## 8. Frontend security

- No secrets in client code or `NEXT_PUBLIC_` vars beyond truly public ones.
- Escape output; never `dangerouslySetInnerHTML` without sanitizing (DOMPurify).
- Store tokens in httpOnly, Secure, SameSite cookies, not localStorage.
- CSP, `rel="noopener noreferrer"` on external links.
- Validate and sanitize file uploads on the server too.

## 9. SEO and metadata

- Unique title/description per page, canonical URLs, Open Graph + Twitter cards.
- Semantic headings, structured data (JSON-LD), sitemap.xml, robots.txt.
- Meaningful URLs, 404 and redirect handling.

## 10. Testing

- Unit: Vitest/Jest for utils and hooks.
- Component: Testing Library (test behavior, not implementation).
- E2E: Playwright for critical flows (auth, checkout, core feature).
- Visual regression optional (Playwright snapshots, Chromatic).
- A11y: axe in CI.

## 11. Frontend module checklist

- [ ] Uses tokens and shared components
- [ ] All states handled (loading/empty/error)
- [ ] Responsive at 360 / 768 / 1280
- [ ] Keyboard and screen-reader pass
- [ ] No console errors/warnings
- [ ] Bundle impact checked
- [ ] Tests for logic and one E2E for the flow
