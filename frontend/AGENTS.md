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
  apps/                  # app registry ONLY (every OS feature mounts as a window here)
    registry.tsx         # window registry — lazy-imports feature screens from module barrels
  modules/
    about/ skills/ projects/ experience/ contact/ auth/ settings/ editor/ widgets/
      index.ts           # barrel — re-exports screens, components, hooks, lib, model (public surface)
      model.ts           # re-exports relevant @shared/types (domain contracts)
      screens/           # <Feature>Screen.tsx — one OS window per feature
      components/        # feature-owned components (folder-per-component, see below)
        <Foo>/Foo.tsx
      hooks/             # use<Feature>X.ts
      lib/               # feature-private helpers/options/categories
    settings/components/primitives.tsx
  components/
    shell/               # OS chrome: Desktop, TopBar, Taskbar, StartMenu, Spotlight,
                         # SystemTrayModal, WindowFrame, ModuleHost (folder-per-component)
    ui/                  # shared, cross-module atomic UI (folder-per-component):
                         # CompactPageHero, CompactRow, UserAvatar, SectionCard, WebView, …
  context/               # AuthContext, ThemeContext, WindowsContext, WidgetsContext,
                         # ShellUIContext, ContentContext — one narrow concern each
  lib/
    api/                 # httpClient (envelope unwrap), services, themeService
    osLayout.ts          # getWorkspaceBounds + fitRectInBounds (single source of truth)
    shortcuts/           # shortcut registry (SHORTCUTS drives Settings → Shortcuts too)
    sound.ts wallpapers.ts gridUtils.ts
  data/portfolio.ts      # local fallback data when the API is unreachable
  styles/                # theme.ts (ThemeState, palettes, applyTheme), global.css
  types.ts               # AppDef, WindowState, WidgetMeta, … (OS-level types only)
```

Components are **folder-per-component**: `components/ui/Button/Button.tsx`,
`modules/editor/components/ProfileTab/ProfileTab.tsx`. One file per component
inside its own PascalCase folder; no loose `.tsx` files in a category folder.
Where a component is referenced across modules it must live in `components/ui/`;
feature-private pieces stay inside their module's `components/`. Cross-module
imports go through the module **barrel** (`@/modules/skills`, never a deep
`@/modules/skills/components/...` path).

## Rules

### 1. Imports: `@/` absolute only

`@/context/ThemeContext`, `@/components/...`, `@/modules/<feature>`, `@/styles/theme`.
Do NOT use deep relative `../` imports. Cross-module imports use the module
barrel (`@/modules/skills`), never a deep path into the module. Shared API
types come from `@shared/types`; `@shared/types` may not import the app.

### 2. OS shell vs features

- Each `context/*Context.tsx` owns one narrow slice of OS state: theme
  (`ThemeContext`), windows (`WindowsContext`), widgets (`WidgetsContext`),
  shell UI (`ShellUIContext`), plus auth (`AuthContext`) and data/content
  (`ContentContext`). Providers nest `Auth → Theme → Windows → Widgets → ShellUI
  → Content` in `App.tsx`.
- Feature areas mount as OS windows via `apps/registry.tsx` (lazy import from
  `@/modules/<feature>`) — never a standalone page/route.
- Window z stays in `[41, 79]` (see `assignTopZ`): tabs stack above widgets
  (30) and below the taskbar/overlays (80). Never hardcode other z-layers.

### 3. Windows & widgets stay on-screen

- All geometry goes through `lib/osLayout.ts`: `getWorkspaceBounds(theme)` and
  `fitRectInBounds()`. Never hardcode `40/56` bar offsets.
- The taskbar is DOM-measured (`[data-os-taskbar]`) for maximized windows.
- New windows/widgets spawn fitted; drag/resize clamp fully inside bounds.

### 4. Styling

- Tailwind CSS v4 utilities + CSS vars from `styles/theme.ts`/`styles/global.css`
  (`--accent`, `--bg-elev`, `--text-hi/mid/low`, `--border`, `--surface-*`,
  `--text-primary/...`, `--border-*`). Do not hardcode colors.
- `frontend-design` skill for new UI direction; theme tokens stay in `styles/theme.ts`.
- `lucide-react` for icons (never inline SVG or emoji in UI chrome).
- `framer-motion` is installed for window/desktop transitions.
- `zod` is installed but there is **no shared validation layer yet** — contact
  validation lives in the backend controller. If a second form appears, build
  the shared layer first (see ibiz_v2's Rule 14 as reference, not as law).

### 4b. Responsive — container queries, never viewport breakpoints (ibiz parity)

- `.window-frame` root and `.window-body` are `@container` anchors;
  `.widget-card` too. Everything inside windows/widgets keys off the
  **container**, never the viewport: use `@sm:`/`@md:` (or `@min-[…]:`)
  variants. `sm:`/`md:`/`lg:` viewport prefixes inside windows are banned.
- Every grid is `grid grid-cols-12` with explicit `col-span-*` cells.
  Container variants use Tailwind v4's container scale (`@md` = 28rem/448px,
  `@2xl` = 42rem/672px — NOT viewport breakpoints). Ladder for OS windows:
  `col-span-12` → `@md:col-span-6` (2-up) → `@2xl:col-span-4` (3-up).
  Span cells total 12 per visual row.
- Page heroes use `components/ui/CompactPageHero`; dense rows use
  `components/ui/CompactRow` — both collapse automatically in narrow windows
  (540/600px `@container` rules in `global.css`). Don't hand-roll hero cards
  or list rows when these cover the need.

### 5. Settings & theme

- `styles/theme.ts` is the source of truth (`ThemeState`, `DEFAULT_THEME`,
  `applyTheme`, `loadTheme` with stale-default sanitizing). New theme fields
  need: type + default + `applyTheme` var + `loadTheme` sanitize + backend
  `ThemeController` validation + `shared` type if it crosses the API.
- Theme persists localStorage-first, debounced server sync via `themeService`
  (`/api/theme`). Server wins on boot when a row exists; all calls fail soft
  offline.

### 6. Naming conventions

- Components: **folder-per-component** — PascalCase folder + PascalCase file
  (`components/ui/Button/Button.tsx`); the export matches the file name.
- Hooks: `use` + PascalCase (`useIsMobile`), in `lib/hooks` or module `hooks/`.
- Services: camelCase (`themeService.ts`, `services.ts`).
- Module barrels: `modules/<feature>/index.ts` re-exports the module's public
  surface (screens, components, hooks, lib). Registry imports screens from
  barrels only.

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
