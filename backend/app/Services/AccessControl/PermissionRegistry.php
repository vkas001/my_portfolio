<?php

namespace App\Services\AccessControl;

/**
 * Single source of truth for admin capabilities — the ibiz_v2
 * PermissionRegistry pattern collapsed to a single-user scope: the one
 * signed-in admin implicitly holds every permission; guests hold none.
 * The strings only carry intent + route documentation here; enforcement
 * lives in RequirePermission (asserts users.is_admin).
 */
class PermissionRegistry
{
    public const PROFILE_MANAGE = 'profile:manage';

    public const SKILL_MANAGE = 'skill:manage';

    public const PROJECT_MANAGE = 'project:manage';

    public const EXPERIENCE_MANAGE = 'experience:manage';

    public const THEME_MANAGE = 'theme:manage';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::PROFILE_MANAGE,
            self::SKILL_MANAGE,
            self::PROJECT_MANAGE,
            self::EXPERIENCE_MANAGE,
            self::THEME_MANAGE,
        ];
    }
}
