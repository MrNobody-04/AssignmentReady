---
name: dev-standards
description: Master standards for building any website, web app, mobile app or system with AI. Use at the start of every project and before every module. Covers architecture, design, frontend, backend, database, API, security, performance and the RAPS workflow.
---

# Dev Standards: Master Skill

Read this file first on every project. Then load only the reference files the current task needs.

## Load order

| Task | Read |
|---|---|
| New project / folder setup | `references/architecture.md`, `references/rules.md` |
| Any UI, landing page, dashboard | `references/design.md`, `references/frontend.md` |
| Server logic, services | `references/backend.md`, `references/api.md` |
| Tables, queries, migrations | `references/database.md` |
| Auth, input, secrets, deploy | `references/security.md` |
| Slow pages, heavy queries | `references/performance.md` |
| Setting up agents / Antigravity | `references/raps-antigravity.md` |
| Finding inspiration or docs | `references/links.md` |
| Before saying "done" | `references/definition-of-done.md` |

## The 10 non-negotiables

1. **Plan before code.** Write a one-page spec: goal, users, modules, data, risks.
2. **One module at a time.** Build, test, commit, then move on. Never generate the whole project in one pass.
3. **3 layers always.** Presentation -> Business logic -> Data access. No layer skipping.
4. **Security by default.** Validate every input, authorize every request, never hardcode secrets.
5. **Performance budget from day one.** Not a final-week fix.
6. **Design tokens only.** No raw hex, px or font names inside components.
7. **Reuse before create.** Search the codebase for an existing component or util first.
8. **No dead code.** Delete unused files, imports, variables, commented-out blocks, unused packages.
9. **No AI-template look.** Follow `design.md` anti-patterns list strictly.
10. **Prove it works.** Tests, lint, type-check and a manual check pass before the next module.

## Standard workflow for every module

```
SPEC -> SCAFFOLD -> IMPLEMENT -> TEST -> SECURITY CHECK -> PERF CHECK -> CLEAN -> COMMIT -> NEXT
```

When prompting an AI agent, always include: module name, inputs/outputs, files it may touch, files it must not touch, acceptance criteria.
