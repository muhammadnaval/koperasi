<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('journal_no')->unique(); // JRN-YYYYMM-000001
            $table->date('entry_date');
            $table->text('description');
            $table->string('source_type'); // savings, disbursement, payment, shu
            $table->string('source_id');
            $table->string('status')->default('posted'); // posted, reversed
            $table->string('posted_by');
            $table->timestamp('posted_at');
            $table->timestamps();

            $table->unique(['source_type', 'source_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
