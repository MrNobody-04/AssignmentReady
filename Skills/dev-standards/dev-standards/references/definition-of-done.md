# Definition of Done

A module is done only when every box is checked. Paste this into the final prompt of each module.

## Code
- [ ] Follows 3 layers and folder standard
- [ ] Reuses existing components/utils; no duplication added
- [ ] No dead code, unused imports, commented-out blocks, unused deps
- [ ] Typed (strict), linted, formatted; zero warnings

## Behavior
- [ ] Acceptance criteria met and demonstrated
- [ ] Loading, empty, error and success states handled
- [ ] Edge cases and failure paths tested

## Tests
- [ ] Unit tests for logic
- [ ] Integration/API tests for endpoints
- [ ] E2E test for the main user flow (if user-facing)
- [ ] All tests green locally and in CI

## Security
- [ ] AuthN + AuthZ on every route; IDOR checked
- [ ] Input validated server-side; output encoded
- [ ] No secrets in code or logs
- [ ] Dependencies audited

## Performance
- [ ] No budget regression (bundle size, LCP/INP/CLS)
- [ ] Queries indexed, no N+1, lists paginated
- [ ] Images and fonts optimized

## Design (UI work)
- [ ] Tokens only; no AI-template tells
- [ ] Verified at 360, 768, 1280, 1536 px; light and dark
- [ ] Keyboard and contrast check passed
- [ ] Real copy and real content

## Docs and delivery
- [ ] README / env example / OpenAPI updated
- [ ] Migration reviewed and reversible
- [ ] Conventional commit, PR summary written
- [ ] Summary of what changed, how it was verified, open questions

## Project-level release gate
- [ ] Lighthouse mobile 90+ perf, 95+ a11y/best-practices/SEO
- [ ] Security headers and HTTPS verified
- [ ] Backup and restore tested
- [ ] Monitoring, error tracking, and alerts live
- [ ] Rollback plan ready
