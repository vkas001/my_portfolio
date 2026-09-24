<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('open_to_work')->nullable()->after('personal_note');
            $table->string('strengths_title')->nullable()->after('open_to_work');
            $table->string('strengths_icon')->nullable()->after('strengths_title');
            $table->string('personal_note_title')->nullable()->after('strengths_icon');
            $table->string('personal_note_icon')->nullable()->after('personal_note_title');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'open_to_work', 'strengths_title', 'strengths_icon',
                'personal_note_title', 'personal_note_icon',
            ]);
        });
    }
};
