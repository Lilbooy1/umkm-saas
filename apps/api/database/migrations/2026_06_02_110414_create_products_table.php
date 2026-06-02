<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_category_id')
                ->nullable()
                ->constrained('product_categories')
                ->nullOnDelete();

            $table->string('name', 160);
            $table->string('slug', 180);
            $table->string('sku', 80)->nullable();

            $table->text('description')->nullable();

            $table->string('product_type', 30)->default('physical');
            $table->decimal('price', 14, 2);
            $table->decimal('compare_at_price', 14, 2)->nullable();

            $table->unsignedInteger('stock_quantity')->default(0);
            $table->boolean('track_stock')->default(true);

            $table->boolean('is_preorder')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);

            $table->string('image_url')->nullable();

            $table->timestamps();

            $table->unique(['store_id', 'slug']);
            $table->index(['store_id', 'product_category_id']);
            $table->index(['store_id', 'is_active']);
            $table->index(['store_id', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
