---
name: interaction-contract
description: Behavior-complete UI work for the portfolio OS. Use whenever building, changing, or fixing any user-facing interface or interaction — buttons, forms, tabs, pills, scroll strips, dialogs, menus, lists, editor screens, settings tabs, shell chrome (desktop, taskbar, windows, spotlight, tray), or verifying frontend behavior with headless Chrome. Also use when a UI decision has competing options and needs analysis with a recommendation. Even when the request sounds trivial ("one-line change"), apply the full contract below — trivial-sounding UI changes are where dead controls and unverified behavior hide.
---

# Interaction Contract

Eliminates "you should have known" follow-ups. The requester holds the full
interaction model in their head; re-specifying it every task wastes both
sides. This skill is that model, written down once.

## Scope

Any user-facing UI or interaction change in `frontend/` — and backend changes
that alter observable behavior (toasts, lists, reload semantics). Pure
logic/type-only changes stay on `typecheck` + `build`.

## 1. Contract — intent over literalism

Implement the obvious complete behavior, not just the asked slice:

- Close closes; Cancel discards; Save persists **and** reflects in the list
  with no manual reload.
- Every visible control does something. No dead buttons, no silent no-ops —
  if a control can't work yet, say so in the report instead of shipping it
  inert.
- Loading, empty, and error states render something sensible.
- Input works the way users provide it: a mouse wheel scrolls scrollable
  strips, strips are also mouse-draggable, trackpad/touch keep native
  gestures; keyboard reaches every control (Tab / Enter / Escape where they
  apply). A click threshold separates clicks from drags, and a real drag
  suppresses the click that follows so swipes never activate controls.
- New work follows the file's established conventions (theme tokens, `@/`
  imports, container queries, app registry, API envelope) without being told.

Why this matters: each of these was once a follow-up round-trip ("the list
doesn't update", "wheel does nothing", "that button does nothing"). The
contract is the default; any deliberate deviation gets flagged in the report,
never silently shipped.

## 2. Decisions — confusion is the agent's work

- **Obvious mechanics:** just do them. One line in the report.
- **Confusing but analyzable** (two valid patterns, where state should live,
  perf vs simplicity): analyze using codebase evidence and repo precedent,
  pick one, proceed. Show the reasoning in 2–3 lines so it can be vetoed in
  seconds. Being torn means there is analysis to do — do it, then decide.
- **Taste, copy, brand feel** (no analysis resolves it): recommend one, offer
  one compact either/or. Never an open-ended question.
- **High-stakes or hard to reverse** (data loss, migrations, deleting work,
  new dependencies): stop and ask first, recommendation attached. Always.
- **Ambiguous requirements:** state the assumption in the report
  (`Assumed X; say the word if Y`) and proceed. Silence means agreement.

## 3. Verification — prove the user-observable outcome

- UI/interaction changes: drive the running app with **realistic input** via
  headless Chrome + raw CDP — real clicks (`clickCount`), real `mouseWheel`
  deltas, real press-move-release drags, real key events. Assert what the user
  would see (row counts, `scrollLeft`, rendered text, active states).
- Programmatic shortcuts (`scrollTo`, direct function calls, synthetic state)
  never count as sole proof — a probe that bypasses the input path proves
  nothing about the input path.
- Know headless limits and state them: `backdrop-filter` doesn't render
  headless (assert computed style instead). Anything unverifiable is declared,
  never claimed.
- Probe hygiene: exactly one `npm run dev` on `:3000` — never two (a second
  instance breaks HMR; if port 3000 is taken, kill the stray first). Backend
  at the LAN URL, never the loopback proxy. Fresh Chrome profile per run,
  kill zombie Chromes after. Clean up test rows via the API. Leave
  `git status` free of probe residue.
- Gates still apply: `npm run typecheck` + `npm run build` green, backend
  `php artisan test` when the API is touched, MCP fast re-index after.

## 4. Report — compact, veto-friendly

- What changed (files, one line each).
- How each behavior was verified, and with what input.
- Assumptions taken; open taste calls as either/or.
- What was deliberately not done, if anything.
