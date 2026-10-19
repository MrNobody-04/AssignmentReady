# RAPS Framework for Antigravity

RAPS = **R**ules, **A**rmoury, **P**arallel Agents, **S**erverless Running.
Use it to turn Antigravity (or any agentic IDE) from "one chat that writes everything" into a controlled, repeatable build system.

> Antigravity features and folder names change between releases. Confirm exact locations for rules, workflows and skills in the current docs: https://antigravity.google/docs

## R - Rules (what the agent must always obey)

Rules are short, always-on constraints. Keep them small, specific and testable.

Put project rules where Antigravity loads them (commonly a workspace rules folder such as `.agent/rules/`) and global rules in your global rules location. Suggested rule files:

| File | Content |
|---|---|
| `00-core.md` | Points from `rules.md`: small modules, no dead code, reuse first, no guessing packages |
| `10-architecture.md` | 3-layer rule, folder structure, import boundaries |
| `20-design.md` | Tokens only, anti-AI-template list, component states, responsive widths |
| `30-security.md` | Validate input, authorize every route, no secrets, safe uploads |
| `40-performance.md` | Budgets (LCP/INP/CLS, bundle size), image/font rules |
| `50-testing.md` | Test per module, commands to run before "done" |

Rule-writing tips:
- Use imperative sentences ("Never import repositories in controllers").
- Include the command that verifies it (`pnpm lint && pnpm typecheck && pnpm test`).
- Link to the long reference instead of pasting it (`See skills/dev-standards/references/design.md`).
- If a rule is ignored repeatedly, make it shorter and move it to the top.

## A - Armoury (skills, tools, workflows the agent can reach for)

The Armoury is everything the agent can pull in on demand:

- **Skills**: this `dev-standards` folder, plus focused skills (`landing-page`, `dashboard`, `api-module`, `db-migration`, `security-review`). Each skill = a folder with `SKILL.md` (name + description + when to use) and `references/`.
- **Workflows / slash commands**: repeatable procedures, e.g. `/new-module`, `/review`, `/cleanup-dead-code`, `/release-check`.
- **MCP servers / tools**: GitHub, database inspector, browser/Playwright, Figma, docs search, Sentry.
- **Templates**: starter repos (Next.js + NestJS + Postgres), component library, CI config.

Armoury rules:
- Description in each `SKILL.md` must say *when* to trigger it.
- Keep `SKILL.md` short; push detail into `references/` (load on demand to save context).
- Give agents least-privilege tools (read-only DB for analysis agents).
- Use `skill-creator` to create, test and refine each skill instead of writing them ad hoc.

### Workflow templates (put in your workflows folder)

**/new-module**
1. Ask for module name, entities, endpoints, UI screens.
2. Write the spec and contracts (schema, OpenAPI, types).
3. Migration + repository -> service -> controller -> tests.
4. Frontend feature folder -> components -> states -> tests.
5. Run lint, type-check, tests. Run security and performance checklists.
6. Remove dead code. Summarize changes. Stop.

**/review**
Review the diff against `rules.md`, `security.md`, `definition-of-done.md`; list issues by severity; do not auto-fix without approval.

**/cleanup-dead-code**
Run `knip` / `depcheck` / linter unused rules; list candidates; delete after confirmation; re-run tests.

**/release-check**
Run full tests, build, Lighthouse CI, dependency audit, secret scan, migration dry run.

## P - Parallel Agents (split work, then merge safely)

Use several agents at once only when tasks are independent.

Good parallel splits:
- Agent 1: backend module (schema, service, API)
- Agent 2: frontend feature against the agreed OpenAPI contract (mock server)
- Agent 3: tests and docs
- Agent 4: reviewer (security + performance + design QA) on finished branches

Rules for parallel work:
1. **Contract first.** Agree types / OpenAPI before anyone codes.
2. **Disjoint files.** Assign each agent its own folders; list "may touch / must not touch".
3. **Separate branches or worktrees** per agent; merge one at a time.
4. **Single integrator** (you or one agent) resolves conflicts and runs the full test suite.
5. **Reviewer agent never writes the feature**; it only reports.
6. **Small scope per agent** (one module, not the whole app). Time-box and require a summary.
7. Never run two agents on the same migration or the same shared config.

Prompt template per agent:

```
Role: <backend|frontend|tests|reviewer>
Module: <name>
Contract: <link/path to spec, OpenAPI, types>
May touch: <paths>
Must NOT touch: <paths>
Acceptance criteria: <bullet list>
Checks to run before reporting: <commands>
Output: summary of changes, files changed, how verified, open questions
```

## S - Serverless Running (run and ship without managing servers)

Prefer managed, scale-to-zero infrastructure so agents and apps run without server babysitting.

- **Frontend / SSR**: Vercel, Netlify, Cloudflare Pages/Workers.
- **API / functions**: Vercel Functions, Cloudflare Workers, AWS Lambda, Google Cloud Run (containers that scale to zero).
- **Database**: Neon / Supabase (Postgres), PlanetScale-style managed MySQL, Upstash (Redis, Kafka), Cloudflare D1/R2.
- **Queues/cron**: Upstash QStash, Inngest, Trigger.dev, Cloud Scheduler, GitHub Actions schedules.
- **Storage**: S3, Cloudflare R2, Supabase Storage.
- **Agent runs**: background / cloud agents and scheduled tasks for long jobs (test runs, audits, migrations dry runs), triggered from CI or the IDE.

Serverless rules:
- Functions stateless, fast cold start, small bundles; keep connections pooled (serverless drivers / pgbouncer).
- Respect execution time and memory limits; push long work to queues.
- Secrets in the platform's secret store; per-environment config; preview deployments per PR.
- Watch cost: set budgets/alerts, rate limits, caching.
- Keep a Docker path (Cloud Run / VPS) if you need long-running or WebSocket workloads.
- CI/CD: PR -> preview deploy -> automated checks -> merge -> production deploy -> smoke test -> rollback ready.

## Using RAPS day to day

1. Start project: copy `dev-standards` into the project's skills folder, generate rule files from the table above.
2. Write the spec and split into modules.
3. For each module: run `/new-module` (single agent) or parallel agents with contracts.
4. Reviewer agent + `/review`, then `/cleanup-dead-code`.
5. Merge, deploy to a preview (serverless), run `/release-check`.
6. Repeat for the next module.

## Making Antigravity produce stunning landing pages and dashboards

- Give it a **design brief** (see `design.md` section 2) plus 3-5 reference links and real copy.
- Provide **tokens first** (`tokens.css`); ask it to build only from tokens.
- Ask for **distinct sections**, not a template: specify composition per section (asymmetric hero, editorial grid, product-in-context).
- Use the browser/Playwright tool so the agent screenshots at 360 / 768 / 1280 and fixes issues itself.
- Add a visual QA step: "List which items from the AI-template tells list appear on this page and fix them."
- Iterate section by section; keep the best version in git before the next pass.
