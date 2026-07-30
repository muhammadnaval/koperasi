<?php

declare(strict_types=1);

namespace App\Services\Loans;

use App\Domain\Loans\FlatLoanCalculator;
use App\Enums\InstallmentStatus;
use App\Enums\LoanAppStatus;
use App\Enums\LoanStatus;
use App\Models\AuditLog;
use App\Models\Installment;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\SavingsProduct;
use App\Models\Setting;
use App\Services\Accounting\JournalService;
use App\Services\Savings\SavingService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LoanService
{
    public function __construct(
        private readonly ?JournalService $journalService = null,
        private readonly ?SavingService $savingService = null
    ) {}

    private function getJournalService(): JournalService
    {
        return $this->journalService ?? app(JournalService::class);
    }

    private function getSavingService(): SavingService
    {
        return $this->savingService ?? app(SavingService::class);
    }

    /**
     * Submit new loan application.
     */
    public function submitApplication(array $params, string $actorName = 'Member'): LoanApplication
    {
        return DB::transaction(function () use ($params, $actorName) {
            $nextCount = LoanApplication::count() + 1;
            $applicationNo = sprintf('PNG-%s-%06d', date('Ym'), $nextCount);

            $app = LoanApplication::create([
                'application_no' => $applicationNo,
                'member_id' => $params['member_id'],
                'loan_product_id' => $params['loan_product_id'],
                'requested_amount' => (int) $params['requested_amount'],
                'requested_term_months' => (int) $params['requested_term_months'],
                'purpose' => $params['purpose'],
                'status' => LoanAppStatus::SUBMITTED,
                'submitted_at' => now(),
                'attachments' => $params['attachments'] ?? [],
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'member',
                'action' => 'SUBMIT_LOAN_APPLICATION',
                'entity_type' => 'LoanApplication',
                'entity_id' => $app->application_no,
                'after' => $app->toArray(),
            ]);

            return $app;
        });
    }

    /**
     * Approve loan application with final parameter snapshot.
     */
    public function approveApplication(string $applicationId, array $params, string $actorName = 'Approver'): LoanApplication
    {
        return DB::transaction(function () use ($applicationId, $params, $actorName) {
            /** @var LoanApplication $app */
            $app = LoanApplication::where('id', $applicationId)->lockForUpdate()->firstOrFail();
            if ($app->status === LoanAppStatus::APPROVED || $app->status === LoanAppStatus::DISBURSED) {
                throw new InvalidArgumentException('Pengajuan telah disetujui sebelumnya.');
            }

            $app->update([
                'status' => LoanAppStatus::APPROVED,
                'approved_amount' => (int) ($params['approved_amount'] ?? $app->requested_amount),
                'approved_term_months' => (int) ($params['approved_term_months'] ?? $app->requested_term_months),
                'approved_annual_rate' => (float) ($params['approved_annual_rate'] ?? 10.0),
                'decision_reason' => $params['decision_reason'] ?? 'Disetujui',
                'approved_by' => $actorName,
                'decided_at' => now(),
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'approver',
                'action' => 'APPROVE_LOAN_APPLICATION',
                'entity_type' => 'LoanApplication',
                'entity_id' => $app->application_no,
                'after' => $app->toArray(),
            ]);

            return $app;
        });
    }

    /**
     * Disburse approved loan application atomically into Loan + Installment schedules.
     */
    public function disburseLoan(string $applicationId, string $disbursementDate, string $actorName = 'Staff'): Loan
    {
        return DB::transaction(function () use ($applicationId, $disbursementDate, $actorName) {
            /** @var LoanApplication $app */
            $app = LoanApplication::where('id', $applicationId)->lockForUpdate()->firstOrFail();
            if ($app->status !== LoanAppStatus::APPROVED) {
                throw new InvalidArgumentException('Hanya pengajuan berstatus APPROVED yang dapat dicairkan.');
            }

            $nextCount = Loan::count() + 1;
            $loanNo = sprintf('PJM-%s-%06d', date('Ym'), $nextCount);

            $principalAmount = $app->approved_amount ?? $app->requested_amount;
            $termMonths = $app->approved_term_months ?? $app->requested_term_months;
            $annualRate = $app->approved_annual_rate ?? 10.0;

            $product = $app->loanProduct;
            $riskFeePct = (float) ($product?->risk_fee_percentage ?? 0.50);
            $mandatorySavingPct = (float) ($product?->mandatory_saving_percentage ?? 0.50);

            $calc = FlatLoanCalculator::calculate(
                $principalAmount,
                $annualRate,
                $termMonths,
                $disbursementDate,
                $riskFeePct,
                $mandatorySavingPct
            );

            $loan = Loan::create([
                'loan_no' => $loanNo,
                'loan_application_id' => $app->id,
                'member_id' => $app->member_id,
                'loan_product_id' => $app->loan_product_id,
                'principal_amount' => $principalAmount,
                'term_months' => $termMonths,
                'annual_interest_rate' => $annualRate,
                'risk_fee_percentage' => $riskFeePct,
                'mandatory_saving_percentage' => $mandatorySavingPct,
                'risk_fee_amount' => $calc->riskFeeAmount,
                'mandatory_saving_amount' => $calc->mandatorySavingAmount,
                'net_disbursement_amount' => $calc->netDisbursementAmount,
                'interest_method' => 'flat',
                'total_interest' => $calc->totalInterest,
                'total_payable' => $calc->totalPayable,
                'outstanding_amount' => $calc->totalPayable,
                'disbursement_date' => $disbursementDate,
                'first_due_date' => $calc->schedule[0]['due_date'] ?? $disbursementDate,
                'status' => LoanStatus::ACTIVE,
            ]);

            foreach ($calc->schedule as $sch) {
                Installment::create([
                    'loan_id' => $loan->id,
                    'sequence_no' => $sch['sequence_no'],
                    'due_date' => $sch['due_date'],
                    'principal_due' => $sch['principal_due'],
                    'interest_due' => $sch['interest_due'],
                    'late_fee_due' => 0,
                    'total_due' => $sch['total_due'],
                    'paid_amount' => 0,
                    'remaining_amount' => $sch['total_due'],
                    'status' => InstallmentStatus::UNPAID,
                ]);
            }

            if ($calc->mandatorySavingAmount > 0) {
                /** @var SavingsProduct|null $mandatoryProduct */
                $mandatoryProduct = SavingsProduct::where('type', 'mandatory')->first();
                if (! $mandatoryProduct) {
                    $mandatoryProduct = SavingsProduct::create([
                        'code' => 'SW-01',
                        'name' => 'Simpanan Wajib',
                        'type' => 'mandatory',
                        'default_amount' => 50000,
                        'is_active' => true,
                    ]);
                }

                $this->getSavingService()->postTransaction([
                    'member_id' => $app->member_id,
                    'savings_product_id' => $mandatoryProduct->id,
                    'type' => 'deposit',
                    'amount' => $calc->mandatorySavingAmount,
                    'transaction_date' => $disbursementDate,
                    'payment_method' => 'potongan_pinjaman',
                    'description' => "Potongan Simpanan Wajib Pencairan Pinjaman {$loanNo}",
                ], $actorName);
            }

            $journalLines = [
                [
                    'account_code' => '1130',
                    'debit' => $principalAmount,
                    'credit' => 0,
                ],
                [
                    'account_code' => '1110',
                    'debit' => 0,
                    'credit' => $calc->netDisbursementAmount,
                ],
            ];

            if ($calc->mandatorySavingAmount > 0) {
                $journalLines[] = [
                    'account_code' => '3120',
                    'debit' => 0,
                    'credit' => $calc->mandatorySavingAmount,
                ];
            }

            if ($calc->riskFeeAmount > 0) {
                $journalLines[] = [
                    'account_code' => '3220',
                    'debit' => 0,
                    'credit' => $calc->riskFeeAmount,
                ];
            }

            $this->getJournalService()->postJournal([
                'description' => "Pencairan Pinjaman {$loanNo} (Net Disbursement)",
                'source_type' => 'loan_disbursement',
                'source_id' => $loan->id,
                'entry_date' => $disbursementDate,
                'lines' => $journalLines,
            ], $actorName);

            $app->update([
                'status' => LoanAppStatus::DISBURSED,
                'disbursed_at' => now(),
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'staff',
                'action' => 'DISBURSE_LOAN',
                'entity_type' => 'Loan',
                'entity_id' => $loan->loan_no,
                'after' => $loan->toArray(),
            ]);

            return $loan;
        });
    }

    /**
     * T-203: Restructure active loan schedule (extension, rate adjustment).
     */
    public function restructureLoan(string $loanId, int $newTermMonths, float $newAnnualRate, string $reason, string $actorName = 'Admin'): Loan
    {
        return DB::transaction(function () use ($loanId, $newTermMonths, $newAnnualRate, $reason, $actorName) {
            /** @var Loan $loan */
            $loan = Loan::where('id', $loanId)->lockForUpdate()->firstOrFail();
            if ($loan->status !== LoanStatus::ACTIVE) {
                throw new InvalidArgumentException('Hanya pinjaman aktif yang dapat direstrukturisasi.');
            }

            $unpaidInstallments = $loan->installments()->where('status', '!=', InstallmentStatus::PAID)->get();
            $remainingPrincipal = $unpaidInstallments->sum('principal_due') - $unpaidInstallments->sum('paid_amount');
            $remainingPrincipal = max(0, $remainingPrincipal);

            // Delete unpaid installments
            $loan->installments()->where('status', '!=', InstallmentStatus::PAID)->delete();

            $startSeq = ($loan->installments()->max('sequence_no') ?? 0) + 1;
            $calc = FlatLoanCalculator::calculate($remainingPrincipal, $newAnnualRate, $newTermMonths, date('Y-m-d'));

            foreach ($calc->schedule as $idx => $sch) {
                Installment::create([
                    'loan_id' => $loan->id,
                    'sequence_no' => $startSeq + $idx,
                    'due_date' => $sch['due_date'],
                    'principal_due' => $sch['principal_due'],
                    'interest_due' => $sch['interest_due'],
                    'late_fee_due' => 0,
                    'total_due' => $sch['total_due'],
                    'paid_amount' => 0,
                    'remaining_amount' => $sch['total_due'],
                    'status' => InstallmentStatus::UNPAID,
                ]);
            }

            $newTotalPaid = $loan->installments()->sum('paid_amount');
            $newTotalPayable = $newTotalPaid + $calc->totalPayable;

            $loan->update([
                'term_months' => $loan->term_months + $newTermMonths,
                'annual_interest_rate' => $newAnnualRate,
                'total_payable' => $newTotalPayable,
                'outstanding_amount' => $calc->totalPayable,
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'admin',
                'action' => 'RESTRUCTURE_LOAN',
                'entity_type' => 'Loan',
                'entity_id' => $loan->loan_no,
                'after' => ['reason' => $reason, 'new_term' => $newTermMonths, 'new_rate' => $newAnnualRate],
            ]);

            return $loan;
        });
    }

    /**
     * T-204: Early payoff formula calculation with configurable nominal discount amount (Rp).
     */
    public function calculateEarlyPayoff(string $loanId, ?int $customDiscountAmount = null): array
    {
        /** @var Loan $loan */
        $loan = Loan::where('id', $loanId)->firstOrFail();
        $unpaidInstallments = $loan->installments()->where('status', '!=', InstallmentStatus::PAID)->get();

        $remainingPrincipal = (int) $unpaidInstallments->sum('principal_due');
        $unpaidLateFee = (int) $unpaidInstallments->sum('late_fee_due');
        $totalUnearnedInterest = (int) $unpaidInstallments->sum('interest_due');

        $settingAmount = Setting::getByKey('loan_early_payoff_discount_amount', null);
        $effectiveDiscountAmount = $customDiscountAmount
            ?? $loan->loanProduct?->early_payoff_discount_amount
            ?? ($settingAmount !== null ? (int) $settingAmount : $totalUnearnedInterest);

        $waivedInterest = min($totalUnearnedInterest, max(0, $effectiveDiscountAmount));
        $retainedInterest = $totalUnearnedInterest - $waivedInterest;
        $totalPayoffAmount = $remainingPrincipal + $unpaidLateFee + $retainedInterest;

        return [
            'loan_id' => $loan->id,
            'loan_no' => $loan->loan_no,
            'remaining_principal' => $remainingPrincipal,
            'unpaid_late_fee' => $unpaidLateFee,
            'total_unearned_interest' => $totalUnearnedInterest,
            'discount_amount' => $waivedInterest,
            'waived_interest' => $waivedInterest,
            'retained_interest' => $retainedInterest,
            'total_payoff_amount' => $totalPayoffAmount,
        ];
    }

    /**
     * T-204: Process early payoff transaction atomically with configurable discount amount (Rp).
     */
    public function processEarlyPayoff(string $loanId, array $params, string $actorName = 'Staff'): Loan
    {
        return DB::transaction(function () use ($loanId, $params, $actorName) {
            /** @var Loan $loan */
            $loan = Loan::where('id', $loanId)->lockForUpdate()->firstOrFail();
            if ($loan->status !== LoanStatus::ACTIVE) {
                throw new InvalidArgumentException('Hanya pinjaman aktif yang dapat dilunasi secara dipercepat.');
            }

            $discountOverride = isset($params['discount_amount']) ? (int) $params['discount_amount'] : null;
            $payoff = $this->calculateEarlyPayoff($loanId, $discountOverride);

            // Mark all unpaid installments as paid
            foreach ($loan->installments as $inst) {
                if ($inst->status !== InstallmentStatus::PAID) {
                    $inst->update([
                        'paid_amount' => $inst->total_due,
                        'remaining_amount' => 0,
                        'status' => InstallmentStatus::PAID,
                    ]);
                }
            }

            $loan->update([
                'outstanding_amount' => 0,
                'status' => LoanStatus::PAID,
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'staff',
                'action' => 'EARLY_PAYOFF_LOAN',
                'entity_type' => 'Loan',
                'entity_id' => $loan->loan_no,
                'after' => array_merge($payoff, ['payment_method' => $params['payment_method'] ?? 'kas_tunai']),
            ]);

            return $loan;
        });
    }
}
