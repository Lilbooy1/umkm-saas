<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('method', 40)->default('manual_transfer');
            $table->string('provider', 40)->default('manual');

            $table->string('status', 40)->default('waiting_confirmation');
            $table->decimal('amount', 14, 2);

            $table->string('proof_image_url')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['method', 'status']);
            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
