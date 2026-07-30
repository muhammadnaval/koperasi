<?php

declare(strict_types=1);

namespace Tests\Feature\Services;

use App\Enums\MemberStatus;
use App\Enums\SavingsType;
use App\Models\JournalEntry;
use App\Models\LoanProduct;
use App\Models\SavingsProduct;
use App\Services\Loans\LoanService;
use App\Services\Members\MemberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanDeductionTest extends TestCase
{
    use RefreshDatabase;

    public function test_disburse_loan_deducts_risk_fee_and_mandatory_savings_correctly(): void
    {
        $memberService = new MemberService;
        $member = $memberService->registerMember([
            'full_name' => 'Ahmad Subandi',
            'email' => 'ahmad.subandi@mtsn3padang.sch.id',
            'identity_no' => '1371055509920099',
        ]);
        $memberService->updateMemberStatus($member->id, MemberStatus::ACTIVE, 'Aktivasi');

        $loanProduct = LoanProduct::create([
            'code' => 'REG-01',
            'name' => 'Pinjaman Reguler',
            'min_amount' => 1000000,
            'max_amount' => 20000000,
            'min_term_months' => 6,
            'max_term_months' => 24,
            'annual_interest_rate' => 10.0,
            'risk_fee_percentage' => 0.50,
            'mandatory_saving_percentage' => 0.50,
            'is_active' => true,
        ]);

        SavingsProduct::create([
            'code' => 'SW-01',
            'name' => 'Simpanan Wajib',
            'type' => SavingsType::MANDATORY,
            'default_amount' => 50000,
            'minimum_balance' => 0,
            'is_active' => true,
        ]);

        $loanService = app(LoanService::class);

        $app = $loanService->submitApplication([
            'member_id' => $member->id,
            'loan_product_id' => $loanProduct->id,
            'requested_amount' => 10000000,
            'requested_term_months' => 12,
            'purpose' => 'Renovasi Rumah',
        ]);

        $loanService->approveApplication($app->id, [
            'approved_amount' => 10000000,
            'approved_term_months' => 12,
            'approved_annual_rate' => 10.0,
        ]);

        $loan = $loanService->disburseLoan($app->id, '2026-02-01');

        // 1. Verify Loan model deduction attributes
        $this->assertEquals(0.50, $loan->risk_fee_percentage);
        $this->assertEquals(0.50, $loan->mandatory_saving_percentage);
        $this->assertEquals(50000, $loan->risk_fee_amount);
        $this->assertEquals(50000, $loan->mandatory_saving_amount);
        $this->assertEquals(9900000, $loan->net_disbursement_amount);

        // 2. Verify Member's mandatory savings updated
        $freshMember = $member->fresh();
        $this->assertEquals(50000, $freshMember->savings_wajib);

        // 3. Verify Savings Transaction created
        $this->assertDatabaseHas('savings_transactions', [
            'member_id' => $member->id,
            'amount' => 50000,
            'status' => 'posted',
        ]);

        // 4. Verify Journal Entry posted and balanced
        /** @var JournalEntry $journal */
        $journal = JournalEntry::where('source_type', 'loan_disbursement')
            ->where('source_id', $loan->id)
            ->firstOrFail();

        $this->assertEquals('posted', $journal->status);

        $totalDebit = 0;
        $totalCredit = 0;
        foreach ($journal->lines as $line) {
            $totalDebit += $line->debit_amount;
            $totalCredit += $line->credit_amount;
        }

        $this->assertEquals(10000000, $totalDebit);
        $this->assertEquals(10000000, $totalCredit);

        // Lines breakdown assertion
        $this->assertDatabaseHas('journal_lines', [
            'journal_entry_id' => $journal->id,
            'debit_amount' => 10000000, // Piutang
            'credit_amount' => 0,
        ]);

        $this->assertDatabaseHas('journal_lines', [
            'journal_entry_id' => $journal->id,
            'debit_amount' => 0,
            'credit_amount' => 9900000, // Kas
        ]);

        $this->assertDatabaseHas('journal_lines', [
            'journal_entry_id' => $journal->id,
            'debit_amount' => 0,
            'credit_amount' => 50000, // Simpanan Wajib & Dana Risiko
        ]);
    }
}
