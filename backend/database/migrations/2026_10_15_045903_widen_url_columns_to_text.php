<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * User-pasted URLs (long Google image links, signed URLs, query strings)
     * routinely exceed VARCHAR(255) while validation allows up to 2048 chars
     * — MySQL then fails the save with SQLSTATE 22001 instead of a clean
     * response. Widen every URL column to TEXT.
     *
     * Raw MODIFY because changing columns via the schema builder needs
     * doctrine/dbal; skipped on SQLite, which never enforces string lengths.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $columns = [
            'profiles' => ['avatar_url', 'resume_url'],
            'social_links' => ['url'],
            'projects' => ['live_url', 'github_url', 'image_url'],
            'blogs' => ['cover_url'],
        ];

        foreach ($columns as $table => $names) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            foreach ($names as $column) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` TEXT NULL");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $columns = [
            'profiles' => ['avatar_url', 'resume_url'],
            'social_links' => ['url'],
            'projects' => ['live_url', 'github_url', 'image_url'],
            'blogs' => ['cover_url'],
        ];

        foreach ($columns as $table => $names) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            foreach ($names as $column) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` VARCHAR(255) NULL");
            }
        }
    }
};
