<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loan_products', function (Blueprint $table) {
            $table->integer('grace_period_days')->default(3)->after('late_fee_percentage');
            $table->string('late_fee_type')->default('percent_of_interest')->after('grace_period_days');
        });
    }

    public function down(): void
    {
        Schema::table('loan_products', function (Blueprint $table) {
            $table->dropColumn(['grace_period_days', 'late_fee_type']);
        });
    }
};
