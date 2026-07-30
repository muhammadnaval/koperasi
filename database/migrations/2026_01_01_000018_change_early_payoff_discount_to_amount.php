<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loan_products', function (Blueprint $table) {
            if (Schema::hasColumn('loan_products', 'early_payoff_discount_percentage')) {
                $table->dropColumn('early_payoff_discount_percentage');
            }
            if (! Schema::hasColumn('loan_products', 'early_payoff_discount_amount')) {
                $table->unsignedBigInteger('early_payoff_discount_amount')->nullable()->after('late_fee_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loan_products', function (Blueprint $table) {
            if (Schema::hasColumn('loan_products', 'early_payoff_discount_amount')) {
                $table->dropColumn('early_payoff_discount_amount');
            }
            if (! Schema::hasColumn('loan_products', 'early_payoff_discount_percentage')) {
                $table->decimal('early_payoff_discount_percentage', 5, 2)->default(100.00)->after('late_fee_type');
            }
        });
    }
};
