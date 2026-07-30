<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('application_no')->unique(); // PNG-YYYYMM-000001
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('loan_product_id')->constrained('loan_products')->cascadeOnDelete();
            $table->bigInteger('requested_amount');
            $table->integer('requested_term_months');
            $table->text('purpose');
            $table->string('status')->default('submitted'); // draft, submitted, under_review, approved, rejected, cancelled, disbursed
            $table->bigInteger('approved_amount')->nullable();
            $table->integer('approved_term_months')->nullable();
            $table->decimal('approved_annual_rate', 5, 2)->nullable();
            $table->text('review_notes')->nullable();
            $table->text('decision_reason')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamp('disbursed_at')->nullable();
            $table->jsonb('attachments')->nullable();
            $table->timestamps();

            $table->index(['member_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_applications');
    }
};
