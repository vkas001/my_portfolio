# AGENTS.md — portfolio OS (frontend)

React 19 + Vite 6 + Tailwind CSS v4 desktop-OS shell. Follow these conventions
on every change. (Adapted from ibiz_v2's frontend AGENTS.md; ibiz-isms that
don't exist here — tenancy, mock layer, SCSS-per-component, zod validation
layer — were dropped. Do not reintroduce them.)

## Commands

- `npm run dev` — dev server (port 3000, proxies `/api` → `localhost:4000`)
- `npm run build` — `tsc --noEmit` + production build
- `npm run typecheck` — `tsc --noEmit` typecheck
- `npm run lint` — eslint (may not be configured; typecheck is the gate)
- There is no test runner or E2E harness here; verify with `typecheck` + `build`
  and, for UI behavior, a headless-Chrome pass with screenshots.

## Directory structure (follow exactly)

```
src/
  apps/                  # OS windows: About, Skills, Projects, Experience, Contact, Settings
    registry.tsx         # app registry — every OS feature mounts as a window here
  components/
    desktop/             # shell: Desktop, TopBar, Taskbar, StartMenu, Spotlight, SystemTrayModal
    windows/             # WindowFrame, ModuleHost
    widgets/             # WidgetsPanel, WidgetCard, registry.tsx, widget implementations
    settings/            # Settings primitives (SectionCard, SegmentedControl, Toggle, …)
    modals/              # ContactModal, …
  context/OSContext.tsx  # OS state: theme, windows, widgets, shell UI (single owner)
  lib/
    api/                 # httpClient (envelope unwrap), services, themeService
    osLayout.ts          # workspace insets + fitRectInBounds (single source of truth)
    shortcuts/           # shortcut registry (SHORTCUTS drives Settings → Shortcuts too)
    sound.ts wallpapers.ts gridUtils.ts
  data/portfolio.ts      # local fallback data when the API is unreachable
  theme.ts               # ThemeState, palettes, applyTheme() → CSS vars on <html>
  types.ts               # AppDef, WindowState, WidgetMeta, …
  index.css              # Tailwind v4 + theme tokens + shell styles + ibiz compat tokens
```

Files live **flat inside their category folder** (`components/desktop/Taskbar.tsx`),
not folder-per-component. Do not introduce per-component folders.

## Rules

### 1. Imports: `@/` absolute only

`@/context/OSContext`, `@/components/...`, `@/theme`. Do NOT use deep
relative `../` imports. Shared API types come from `@shared/types`.

### 2. OS shell vs features

- `context/OSContext` owns OS state (theme, windows, widgets, shell UI).
  Feature areas mount as OS windows via `apps/registry.tsx` — never a
  standalone page/route.
- Window z stays in `[41, 79]` (see `assignTopZ`): tabs stack above widgets
  (30) and below the taskbar/overlays (80). Never hardcode other z-layers.

### 3. Windows & widgets stay on-screen

- All geometry goes through `lib/osLayout.ts`: `getWorkspaceBounds(theme)` and
  `fitRectInBounds()`. Never hardcode `40/56` bar offsets.
- The taskbar is DOM-measured (`[data-os-taskbar]`) for maximized windows.
- New windows/widgets spawn fitted; drag/resize clamp fully inside bounds.

### 4. Styling

- Tailwind CSS v4 utilities + CSS vars from `theme.ts`/`index.css`
  (`--accent`, `--bg-elev`, `--text-hi/mid/low`, `--border`, `--surface-*`,
  `--text-primary/...`, `--border-*`). Do not hardcode colors.
- `frontend-design` skill for new UI direction; theme tokens stay in `theme.ts`.
- `lucide-react` for icons (never inline SVG or emoji in UI chrome).
- `framer-motion` is installed for window/desktop transitions.
- `zod` is installed but there is **no shared validation layer yet** — contact
  validation lives in the backend controller. If a second form appears, build
  the shared layer first (see ibiz_v2's Rule 14 as reference, not as law).

### 5. Settings & theme

- `theme.ts` is the source of truth (`ThemeState`, `DEFAULT_THEME`,
  `applyTheme`, `loadTheme` with stale-default sanitizing). New theme fields
  need: type + default + `applyTheme` var + `loadTheme` sanitize + backend
  `ThemeController` validation + `shared` type if it crosses the API.
- Theme persists localStorage-first, debounced server sync via `themeService`
  (`/api/theme`). Server wins on boot when a row exists; all calls fail soft
  offline.

### 6. Naming conventions

- Components: PascalCase file + export (`Taskbar.tsx`, `WidgetCard.tsx`).
- Hooks: `use` + PascalCase (`useIsMobile`), in `lib/hooks` or `lib/`.
- Services: camelCase (`themeService.ts`, `services.ts`).

### 7. Approved dependencies

Only packages already in `package.json` may be used. Do NOT add new
dependencies without asking.

### 8. Browser verification

No Playwright harness exists here. For UI behavior changes, drive the Vite dev
server with headless Chrome (puppeteer-core + system Chrome works), assert DOM
rects/state, and capture screenshots — one-shot scripts, ASCII output.

### 9. Definition of Done

- `npm run typecheck` — zero errors.
- `npm run build` — succeeds.
- Backend `php artisan test` still green when the change touches the API.
