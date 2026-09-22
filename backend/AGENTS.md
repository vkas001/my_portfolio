<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>

# portfolio API — project conventions

Laravel 13 (PHP ^8.3) single-user portfolio API. Complements the Boost
guidelines above (adapted from ibiz_v2's backend AGENTS.md; tenancy, Passport,
RBAC, and Scramble sections were dropped — they don't exist here).

## Commands

- `php artisan serve --port=4000` — API server (frontend proxies `/api` here)
- `php artisan test` — PHPUnit (SQLite `:memory:`, see `phpunit.xml`)
- `vendor\bin\pint.bat <file>` (Windows) — format changed PHP files (run before
  finalizing any PHP change)
- `php artisan make:* --no-interaction` — create migrations, controllers,
  models, tests (never hand-roll what a generator covers)

## Data model (single tier, no tenancy)

| Table | Model | Notes |
|---|---|---|
| `profiles` + `social_links` | `Profile`, `SocialLink` | string PKs, one profile row |
| `skills` | `Skill` | string PK, category + proficiency |
| `projects` | `Project` | string PK, `order`, JSON `tech_stack` |
| `experience` | `Experience` | string PK, `order`, JSON highlights |
| `contact_messages` | `ContactMessage` | auto-increment id, throttled + logged |
| `theme_settings` | `ThemeSetting` | **one global row** (`settings` JSON cast) |

Rules:

- Portfolio tables use **string PKs** (`$incrementing = false`, `keyType =
  'string'`); follow the sibling model when adding one.
- `theme_settings` is single-row by design (`updateOrCreate(['id' => 1])`).
  Never scope it per-user. Stale legacy values are normalized in
  `ThemeController` — keep that behavior when adding fields.
- `contact_messages` intake is throttled (`throttle:contact`) and only logged
  outside production — keep both.

## API envelope (mandatory)

Every response is `{ ok: true, data }` / `{ ok: false, error }`
(`routes/api.php` header). New endpoints must return the envelope — the
frontend `http` client throws otherwise. When a response shape changes, update
`shared/src/types.ts` in the same change.

## Skills

Activate the matching `.agents/skills/` skill when working in its domain:
`laravel-patterns`, `laravel-security`, `laravel-tdd`,
`openapi-spec-generation`.

## Verification

- Test every change (`php artisan make:test`, mostly feature tests against
  SQLite memory). Run the narrowest set: `php artisan test
  --filter=ThemeSettingTest`.
- `vendor\bin\pint.bat` on changed files before finishing.

