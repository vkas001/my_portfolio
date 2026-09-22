# my_portfolio — Workspace Guide

Monorepo for a personal-portfolio desktop-OS web app (ported shell patterns from
`D:\projects\ibiz_v2`, simplified to single-user, no tenancy/auth):

```
my_portfolio/
  backend/    Laravel 13 API (PHP 8.3+, SQLite/MySQL, PHPUnit) — profile, skills,
              projects, experience, contact, theme settings
  frontend/   React 19 + Vite 6 + Tailwind CSS v4 desktop-OS shell (portfolio OS)
  shared/     Shared TypeScript types (`@shared/types`) consumed by the frontend
```

Each sub-project has its own `AGENTS.md` with local commands and conventions.
**When working inside a sub-project, read its `AGENTS.md` first and follow it.**
This root file covers cross-cutting structure and rules.

---

## Code search — use the MCP FIRST

The workspace is indexed in the **codebase-memory MCP**. Before reaching for
`grep`/`glob`/manual file reads, search the knowledge graph:

- **`codebase-memory_search_graph`** (project: `D-projects-my_portfolio`) —
  natural-language + semantic search over functions, classes, routes, variables.
  Use this to *find* code by intent.
- **`codebase-memory_get_code_snippet`** — read a specific function/class by its
  qualified name (look it up via `search_graph` first).
- **`codebase-memory_trace_path`** — trace callers/callees, data flow.
- **`codebase-memory_get_architecture`** — architecture overview, hotspots, clusters.
- **`codebase-memory_query_graph`** — complex Cypher queries.

Rules:

- **Prefer MCP search over `grep`/`glob`** for locating code, understanding call
  graphs, and impact analysis.
- Re-index with `codebase-memory_index_repository` on `D:\projects\my_portfolio`
  when you've made many changes and the graph feels stale.
- Fall back to `grep`/`glob`/`read` only for raw text spanning many files, or
  exact string matches the MCP lacks (configs, seeders, CSS values).

---

## Layout & entry points

| Area | Entry point |
|---|---|
| Backend | `backend/AGENTS.md` — Laravel/PHP conventions, artisan, Pint, PHPUnit |
| Frontend | `frontend/AGENTS.md` — React/Vite/Tailwind conventions, app registry, OS shell |
| Shared types | `shared/src/types.ts` — `@shared/types` barrel (single source of truth) |

## Commands

- Frontend: `cd frontend` then `npm run dev` (port 3000), `npm run build`
  (`tsc --noEmit` + `vite build`), `npm run typecheck`, `npm run lint`
- Backend: `cd backend` then `php artisan serve --port=4000`, `php artisan test`,
  `vendor\bin\pint.bat <file>` (Windows) to format changed PHP files
- Root: `npm run dev` (concurrently: frontend + backend), `npm run build`
  (frontend only)

## API envelope

Every backend API response is wrapped as `{ ok: true, data }` /
`{ ok: false, error }` (see `backend/routes/api.php` header comment). The
frontend `http` client (`frontend/src/lib/api/httpClient.ts`) unwraps it —
keep the envelope on any new endpoint.

## Skills

Stack-relevant agent skills live in `.agents/skills/` (copied from ibiz_v2):

- Backend: `laravel-patterns`, `laravel-security`, `laravel-tdd`
- Frontend: `frontend-design`, `theme-factory`
- API/types: `openapi-spec-generation`, `openapi-to-typescript`
- Testing/build: `webapp-testing`, `web-artifacts-builder`
- Workflow: `mcp-builder`, `skill-creator`, `document-project`, `doc-coauthoring`

Activate the matching skill when working in its domain. Pinned versions in
`skills-lock.json`. Heavy/irrelevant packs from the ibiz_v2 library
(canvas-design, office-doc formats, gsap, mobile) were deliberately NOT copied —
ask before pulling in more.

## Cross-project rules

- **Shared types first:** API shapes live in `shared/src/types.ts`. When a
  backend response shape changes, update the shared type in the same change.
- **No secrets:** never commit `.env`, keys, or tokens (see `.gitignore`).
- **No new dependencies** (npm or composer) without asking.
- **Respect per-project conventions:** backend follows its own AGENTS.md (Pint,
  PHPUnit, `artisan make:*`); frontend follows its own (`@/` imports, theme
  tokens, app registry — never a standalone page for OS features).
- **Single-user scope:** there is no tenancy, no auth, no roles. Do not
  introduce multi-user scoping (e.g. per-user theme rows) — theme settings are
  one global row (`theme_settings`), contact is throttled and logged.
- **Docs are not code:** only create documentation files when explicitly asked.
- **Be concise** in explanations — focus on what matters.
