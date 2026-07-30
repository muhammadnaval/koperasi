<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignUuid('installment_id')->constrained('installments')->cascadeOnDelete();
            $table->integer('sequence_no');
            $table->bigInteger('principal_amount')->default(0);
            $table->bigInteger('interest_amount')->default(0);
            $table->bigInteger('late_fee_amount')->default(0);
            $table->bigInteger('total_allocated');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
    }
};
