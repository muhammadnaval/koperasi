<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->bigInteger('min_amount')->default(1000000);
            $table->bigInteger('max_amount')->default(25000000);
            $table->integer('min_term_months')->default(6);
            $table->integer('max_term_months')->default(36);
            $table->string('interest_method')->default('flat');
            $table->decimal('annual_interest_rate', 5, 2)->default(10.00); // 10.00%
            $table->decimal('late_fee_percentage', 5, 2)->default(1.00);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_products');
    }
};
