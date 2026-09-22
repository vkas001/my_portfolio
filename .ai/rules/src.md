---
paths:
  - 'frontend/src/**'
---

# Src

## Vendor CSS bundles with Tailwind preflight must load inside a cascade layer

Any third-party CSS that bundles a Tailwind preflight reset (e.g. a package
CSS containing `* { --tw-translate-x: 0; ... }`) will override every layered
Tailwind transform utility (translate-y-full, -translate-x-1/2, rotate-*,
scale-*) if it loads unlayered — even when lazy-loaded via a component
import. Load such CSS once in `src/index.css` with
`@import "..." layer(components)` (AFTER `@import "tailwindcss"`), and never
`import` the package CSS from components.

Use `layer(components)`, NOT a `layer(vendor)` declared first: `components`
sits between Tailwind's `base` and `utilities`, so the vendor's own box-model
utilities still beat the base preflight while its `--tw-*` reset still loses
to `utilities`.

## Windows launch single-instance by default

`launchApp(appId)` in `context/OSContext` focuses the existing window when the
app's `singleInstance !== false`. For one-window-per-entity behavior there is
no `id` option — extend the registry/launch path rather than inventing a
parallel mechanism.

## Geometry goes through osLayout

Never hardcode bar offsets (`40/56`) — use `getWorkspaceBounds(theme)` and
`fitRectInBounds()` from `lib/osLayout.ts`. Window z must stay in `[41, 79]`
(`assignTopZ` in `OSContext`); the taskbar is DOM-measured
(`[data-os-taskbar]`) for maximized rects.
