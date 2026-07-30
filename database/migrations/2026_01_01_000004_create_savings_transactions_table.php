<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('savings_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference_no')->unique(); // SIM-YYYYMM-000001
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('savings_product_id')->constrained('savings_products')->cascadeOnDelete();
            $table->string('type'); // deposit, withdrawal, adjustment
            $table->bigInteger('amount');
            $table->date('transaction_date');
            $table->string('payment_method')->default('kas_tunai');
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, posted, void
            $table->string('created_by');
            $table->string('posted_by')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->string('voided_by')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->index(['member_id', 'status']);
            $table->index('reference_no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('savings_transactions');
    }
};
