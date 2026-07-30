<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loan_products', function (Blueprint $table) {
            $table->decimal('risk_fee_percentage', 5, 2)->default(0.50)->after('late_fee_percentage');
            $table->decimal('mandatory_saving_percentage', 5, 2)->default(0.50)->after('risk_fee_percentage');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->decimal('risk_fee_percentage', 5, 2)->default(0.50)->after('annual_interest_rate');
            $table->decimal('mandatory_saving_percentage', 5, 2)->default(0.50)->after('risk_fee_percentage');
            $table->bigInteger('risk_fee_amount')->default(0)->after('mandatory_saving_percentage');
            $table->bigInteger('mandatory_saving_amount')->default(0)->after('risk_fee_amount');
            $table->bigInteger('net_disbursement_amount')->nullable()->after('mandatory_saving_amount');
        });
    }

    public function down(): void
    {
        Schema::table('loan_products', function (Blueprint $table) {
            $table->dropColumn(['risk_fee_percentage', 'mandatory_saving_percentage']);
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn([
                'risk_fee_percentage',
                'mandatory_saving_percentage',
                'risk_fee_amount',
                'mandatory_saving_amount',
                'net_disbursement_amount',
            ]);
        });
    }
};
