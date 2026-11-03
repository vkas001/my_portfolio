<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client-work flag + proof screenshots for projects. Additive only so
     * existing rows stay valid without a backfill.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (! Schema::hasColumn('projects', 'is_client')) {
                $table->boolean('is_client')->default(false)->after('featured');
            }
            if (! Schema::hasColumn('projects', 'screenshots')) {
                $table->json('screenshots')->nullable()->after('image_url');
            }
        });
    }

    /** Dev/staging only — drops the columns and their data. */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'is_client')) {
                $table->dropColumn('is_client');
            }
            if (Schema::hasColumn('projects', 'screenshots')) {
                $table->dropColumn('screenshots');
            }
        });
    }
};
