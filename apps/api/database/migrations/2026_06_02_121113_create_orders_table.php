<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('invoice_number', 50)->unique();

            $table->string('customer_name', 120);
            $table->string('customer_email', 150);
            $table->string('customer_phone', 30);

            $table->text('shipping_address');
            $table->text('notes')->nullable();

            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);

            $table->string('status', 40)->default('pending_payment');

            $table->timestamps();

            $table->index(['store_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['store_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
