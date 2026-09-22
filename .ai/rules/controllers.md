---
paths:
  - 'backend/app/Http/Controllers/**'
---

# Controllers

## ThemeController: single global row, legacy values normalized

`theme_settings` holds exactly one row (`updateOrCreate(['id' => 1])`) — never
scope it per-user (there is no auth/tenancy). New theme fields are merged over
the stored JSON. Stale legacy values (e.g. the old default `startupWindows`
that auto-opened windows) are normalized on read AND update — keep that
behavior when adding fields: force-clear the exact legacy value, preserve
every other saved pick.

## API envelope is mandatory

Every response is `{ ok: true, data }` / `{ ok: false, error }`. The frontend
`http` client throws on anything else. New endpoints return the envelope, and
response-shape changes update `shared/src/types.ts` in the same change.

## Contact intake stays throttled and logged

`ContactController@store` is throttled (`throttle:contact`) with a honeypot
rule and only sends mail in production (dev logs). Keep all three when
touching it.
