<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('payment_no')->unique(); // BYR-YYYYMM-000001
            $table->foreignUuid('loan_id')->constrained('loans')->cascadeOnDelete();
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->date('payment_date');
            $table->bigInteger('amount');
            $table->string('method')->default('kas_tunai');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, posted, void
            $table->string('received_by');
            $table->timestamp('posted_at')->nullable();
            $table->string('voided_by')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->index(['loan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
