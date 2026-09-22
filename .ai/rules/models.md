---
paths:
  - backend/app/Models/**
---

# Models

## Portfolio tables use string primary keys

`profiles`, `social_links`, `skills`, `projects`, `experience` use string PKs:
`$incrementing = false`, `keyType = 'string'`, `primaryKey = 'id'`, `id` in
`$fillable`. Follow the sibling model when adding one.

## ThemeSetting is a single JSON row

`theme_settings` has one row with a `settings` JSON cast (`'settings' =>
'array'`). All writes go through `ThemeController` merge logic — never write
this table from anywhere else.
