<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('installments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('loan_id')->constrained('loans')->cascadeOnDelete();
            $table->integer('sequence_no');
            $table->date('due_date');
            $table->bigInteger('principal_due');
            $table->bigInteger('interest_due');
            $table->bigInteger('late_fee_due')->default(0);
            $table->bigInteger('total_due');
            $table->bigInteger('paid_amount')->default(0);
            $table->bigInteger('remaining_amount');
            $table->string('status')->default('unpaid'); // unpaid, partial, paid, overdue
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['loan_id', 'sequence_no']);
            $table->index(['loan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
