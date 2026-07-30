<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('member_no')->unique(); // AGT-YYYY-000001
            $table->foreignUuid('profile_id')->nullable()->constrained('profiles')->nullOnDelete();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('identity_no')->unique(); // NIK
            $table->date('birth_date')->nullable();
            $table->date('join_date');
            $table->string('occupation')->nullable();
            $table->text('address')->nullable();
            $table->string('status')->default('pending'); // pending, active, suspended, inactive
            $table->bigInteger('savings_pokok')->default(0);
            $table->bigInteger('savings_wajib')->default(0);
            $table->bigInteger('savings_sukarela')->default(0);
            $table->bigInteger('total_savings')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('member_no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
