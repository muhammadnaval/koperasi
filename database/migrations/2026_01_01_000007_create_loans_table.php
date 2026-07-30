<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('loan_no')->unique(); // PJM-YYYYMM-000001
            $table->foreignUuid('loan_application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('loan_product_id')->constrained('loan_products')->cascadeOnDelete();
            $table->bigInteger('principal_amount');
            $table->integer('term_months');
            $table->decimal('annual_interest_rate', 5, 2);
            $table->string('interest_method')->default('flat');
            $table->bigInteger('total_interest');
            $table->bigInteger('total_payable');
            $table->bigInteger('outstanding_amount');
            $table->date('disbursement_date');
            $table->date('first_due_date');
            $table->string('status')->default('active'); // active, paid_off, delinquent, written_off
            $table->timestamps();

            $table->index(['member_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
