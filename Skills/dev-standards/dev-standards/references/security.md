# Security Standards

Baseline: OWASP Top 10 (2021) and OWASP ASVS. Treat security as a requirement of every module, not a final step.

## 1. Authentication

- Do not roll your own crypto. Prefer a vetted provider/library (Auth.js, Clerk, Supabase Auth, Keycloak, Passport + proven strategies).
- Passwords: Argon2id (or bcrypt cost >= 12), minimum length 12, check against breached lists, no composition-rule theatre.
- Offer MFA (TOTP/passkeys) especially for admin roles.
- Sessions: httpOnly + Secure + SameSite=Lax/Strict cookies; rotate on login; expire and revoke on logout/password change.
- JWT (if used): short-lived access token (5-15 min) + rotating refresh token stored httpOnly; verify `alg`, `iss`, `aud`, `exp`; keep a revocation path.
- Login, OTP and password reset: rate limit, generic error messages, lockout/backoff, signed single-use reset tokens with short expiry.

## 2. Authorization

- Deny by default. Check permission on every request on the server, never in the UI only.
- Role-based or attribute-based access, centralized in guards/policies.
- **Object-level checks (IDOR)**: always verify the resource belongs to the user/tenant (`WHERE id = ? AND owner_id = ?`).
- Re-authorize on every sensitive action; admin endpoints separate and audited.
- Multi-tenant: enforce tenant isolation in queries or Row Level Security.

## 3. Input and output

- Validate all input on the server with schemas (type, length, range, format), allowlists over blocklists.
- Parameterized queries only (SQL injection). Never build shell commands from user input (command injection).
- Output encoding by context; sanitize rich HTML (DOMPurify / sanitize-html). Avoid `eval`, `innerHTML`, `dangerouslySetInnerHTML`.
- File uploads: allowlist types, verify magic bytes, size limits, random file names, store outside web root/object storage, scan for malware, serve from a separate domain with `Content-Disposition`.
- SSRF: never fetch user-supplied URLs without allowlist/denylist for internal IPs and metadata endpoints.
- Deserialization: avoid untrusted deserialization; use safe formats (JSON) and schema validation.

## 4. Transport and headers

- HTTPS everywhere, HSTS, TLS 1.2+.
- Security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`/`X-Frame-Options`. Use Helmet or framework equivalents.
- CORS: explicit origin allowlist; no wildcard with credentials.
- CSRF: SameSite cookies + CSRF tokens for cookie-authenticated state-changing requests.

## 5. Secrets and configuration

- No secrets in code, git history, client bundles, logs or screenshots.
- Use env vars + secret manager (Doppler, AWS Secrets Manager, Vault, platform secrets). Rotate regularly and on any suspicion.
- Separate keys per environment; least-privilege API keys and scoped tokens.
- Enable secret scanning (GitHub secret scanning, gitleaks) in pre-commit and CI.

## 6. Dependencies and supply chain

- Lockfiles committed; pin versions; review new packages (maintainers, downloads, install scripts).
- Automated updates (Dependabot / Renovate); `npm audit` / `pip-audit` / OSV scanner in CI.
- Verify any package an AI suggests actually exists and is the legitimate one (typosquatting and hallucinated packages are real risks).
- Minimal Docker images, non-root user, regularly rebuilt; scan images (Trivy).

## 7. Data protection and privacy

- Collect the minimum data; define retention and deletion.
- Encrypt sensitive data at rest and in transit; mask PII in logs and UI.
- Provide data export/delete flows where law or users require it (GDPR-style).
- Backups encrypted and access controlled.
- Never store card data yourself; use a PCI-compliant provider (Stripe, etc.).

## 8. Abuse and availability

- Rate limiting, request size limits, timeouts, pagination caps.
- Bot protection on signup/login/forms (Turnstile / reCAPTCHA).
- Queue heavy work; protect expensive endpoints (search, export, AI).
- DDoS/WAF at the edge (Cloudflare or cloud provider).

## 9. AI-specific security

- Keep model API keys server-side.
- Treat user content and retrieved documents as untrusted: prompt injection can try to exfiltrate data or trigger tools.
- Give agents/tools least privilege; require confirmation for destructive actions.
- Validate model output (schema) before using it in queries, shell, HTML or code execution.
- Don't send secrets or unnecessary PII to third-party models.
- Review AI-generated code for insecure defaults: missing auth checks, SQL concatenation, permissive CORS, hardcoded keys, disabled TLS verification.

## 10. Logging, monitoring, response

- Log auth events, permission failures, admin actions, data exports (with request ID, not secrets).
- Alerts on spikes in 401/403/5xx, unusual login patterns.
- Incident plan: who to call, how to revoke keys, how to roll back, how to notify users.
- Regular dependency + config review; periodic penetration test for production systems.

## 11. Pre-release security checklist

- [ ] Every route authenticated + authorized; IDOR tested
- [ ] All inputs validated server-side
- [ ] No secrets in repo/bundle; `.env` ignored
- [ ] Security headers + HTTPS + CORS verified (securityheaders.com, Mozilla Observatory)
- [ ] Rate limits on auth and expensive endpoints
- [ ] Dependency audit clean or risk accepted
- [ ] Uploads restricted and scanned
- [ ] Backups tested; least-privilege DB user
- [ ] Error messages leak nothing
- [ ] Logging excludes secrets and PII
