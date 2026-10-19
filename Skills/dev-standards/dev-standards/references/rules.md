# Core Rules

## 1. Working method (small modules)

1. Break the project into modules (auth, users, billing, dashboard...). Each module is independently buildable and testable.
2. Order modules by dependency: foundation (config, db, auth) -> core domain -> UI shell -> features -> polish.
3. For each module: write the contract first (types / schema / API shape), then implement, then test.
4. Do not start the next module until the current one passes tests, lint and type-check.
5. Commit per module with a clear message (`feat(auth): add refresh token rotation`).
6. If a change touches more than ~10 files, split it.

## 2. Code quality

- Single responsibility: one function does one thing; one file has one purpose.
- Functions under ~40 lines, files under ~300 lines as a guide. Split when exceeded.
- Names reveal intent (`calculateInvoiceTotal`, not `calc` or `doStuff`).
- No magic numbers or strings; use named constants or enums.
- Early returns over deep nesting (max 3 levels).
- Handle errors explicitly. Never swallow with empty `catch`.
- Comments explain *why*, not *what*.
- Strict typing (TypeScript `strict: true`, Python type hints + mypy/pyright).
- Formatter and linter are mandatory (Prettier + ESLint, or Ruff + Black), enforced by pre-commit and CI.

## 3. Reusability

- DRY at the third repetition (rule of three), not the first.
- Shared logic goes to `shared/` or `lib/`; domain logic stays inside its module.
- Components take props and have no hidden global state.
- Config via environment variables; no environment-specific values in code.
- Prefer composition over inheritance.

## 4. Dead code and redundancy (cleanup checklist)

Run after every module and before every release:

- [ ] Remove unused imports, variables, functions, components, routes
- [ ] Remove commented-out code (git remembers it)
- [ ] Remove unused files and assets
- [ ] Remove unused dependencies (`depcheck`, `knip`, `ts-prune`, `vulture`)
- [ ] Remove duplicate utils and near-identical components; merge them
- [ ] Remove unused CSS (Tailwind purges automatically; check custom CSS)
- [ ] Remove unused DB columns, indexes and endpoints
- [ ] Remove stale feature flags and TODOs older than one sprint

Tools: `knip` (JS/TS), `depcheck`, `eslint --report-unused-disable-directives`, `vulture` (Python), `ruff`.

## 5. Naming and file conventions

| Item | Convention |
|---|---|
| Folders, files | `kebab-case` |
| React components | `PascalCase.tsx` |
| Variables, functions | `camelCase` (Python: `snake_case`) |
| Constants | `UPPER_SNAKE_CASE` |
| DB tables / columns | `snake_case`, plural tables |
| Env vars | `UPPER_SNAKE_CASE`, documented in `.env.example` |
| Branches | `feat/`, `fix/`, `chore/` |
| Commits | Conventional Commits |

## 6. Git hygiene

- `main` is always deployable; work on branches; PRs reviewed (AI review counts as a first pass only).
- `.gitignore` covers `.env`, `node_modules`, build output, IDE files.
- Never commit secrets. If leaked, rotate immediately.

## 7. Documentation (minimum)

- `README.md`: what it is, setup, scripts, env vars, folder map.
- `docs/decisions/`: short ADRs for big choices (why this DB, why this framework).
- API documented via OpenAPI.

## 8. Rules for AI agents

- Read existing code and conventions before writing new code.
- Never invent packages or APIs; verify in official docs.
- Never disable lint, type or security checks to make something pass.
- Never edit files outside the scope given.
- Ask when requirements are ambiguous; do not guess on auth, payments or data deletion.
- Explain what changed and how it was verified after each module.
