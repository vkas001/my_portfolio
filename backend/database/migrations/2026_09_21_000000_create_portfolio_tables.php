<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('title');
            $table->text('short_bio')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('resume_url')->nullable();
            $table->string('email');
            $table->string('location');
            $table->unsignedInteger('years_experience')->default(0);
            $table->timestamps();
        });

        Schema::create('social_links', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('profile_id');
            $table->string('label');
            $table->string('url');
            $table->string('icon'); // github | linkedin | twitter | website | email
            $table->timestamps();

            $table->foreign('profile_id')->references('id')->on('profiles')->cascadeOnDelete();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('category'); // languages | frontend | backend | database | devops | design | tools
            $table->unsignedTinyInteger('proficiency')->default(0); // 0-100
            $table->decimal('years_used', 4, 1)->default(0);
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->text('long_description')->nullable();
            $table->json('tech_stack');
            $table->string('category');
            $table->boolean('featured')->default(false);
            $table->string('live_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('image_url')->nullable();
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('order');
            $table->timestamps();
        });

        Schema::create('experience', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('company');
            $table->string('role');
            $table->date('start_date');
            $table->date('end_date')->nullable(); // null = current
            $table->string('location');
            $table->string('employment_type');
            $table->json('highlights');
            $table->json('tech_stack');
            $table->unsignedInteger('order');
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 200);
            $table->string('subject', 150);
            $table->text('message');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('experience');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('profiles');
    }
};
