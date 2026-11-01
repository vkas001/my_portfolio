<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace the users.auth identifier `email` with `username`.
     *
     * Production-safe: the column is added first and backfilled from the
     * existing `email` value so no login identifier is lost, then tightened
     * to unique + not-null before `email`/`email_verified_at` are dropped.
     * `down()` is dev/staging-only (destroys data) — never roll back on prod.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('name');
        });

        // Backfill: preserve the existing login identifier as the username.
        DB::statement('UPDATE `users` SET `username` = `email` WHERE `username` IS NULL');

        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->change();
            $table->string('username')->nullable(false)->change();
        });

        // Drop the old unique index on `email` before dropping the column —
        // SQLite cannot drop an indexed column in place (MySQL handles this
        // internally, but dropping the index first is safe on both drivers).
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email', 'email_verified_at']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * Dev/staging only: restores `email` from `username`, then drops
     * `username`. Destroys data — never run on production.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->after('name');
            $table->timestamp('email_verified_at')->nullable();
        });

        DB::statement('UPDATE `users` SET `email` = `username` WHERE `email` IS NULL');

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_username_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->unique()->change();
            $table->dropColumn('username');
        });
    }
};
