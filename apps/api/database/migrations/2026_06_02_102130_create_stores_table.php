<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();

            $table->string('name', 120);
            $table->string('slug', 140)->unique();

            $table->string('category')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();

            $table->text('address')->nullable();
            $table->text('description')->nullable();

            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['slug', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
