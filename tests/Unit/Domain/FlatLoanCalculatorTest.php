<?php

declare(strict_types=1);

namespace Tests\Unit\Domain;

use App\Domain\Loans\FlatLoanCalculator;
use PHPUnit\Framework\TestCase;

class FlatLoanCalculatorTest extends TestCase
{
    public function test_flat_loan_calculator_correctness(): void
    {
        $principal = 12000000;
        $annualRate = 10.0;
        $termMonths = 12;

        $result = FlatLoanCalculator::calculate($principal, $annualRate, $termMonths, '2026-01-15');

        $this->assertEquals(12000000, $result->principal);
        $this->assertEquals(1200000, $result->totalInterest);
        $this->assertEquals(13200000, $result->totalPayable);
        $this->assertCount(12, $result->schedule);

        // Check total of schedule principal equals original principal
        $sumPrincipal = array_sum(array_column($result->schedule, 'principal_due'));
        $this->assertEquals($principal, $sumPrincipal);

        // Check total of schedule interest equals total interest
        $sumInterest = array_sum(array_column($result->schedule, 'interest_due'));
        $this->assertEquals($result->totalInterest, $sumInterest);

        // Check total of schedule total_due equals total payable
        $sumTotal = array_sum(array_column($result->schedule, 'total_due'));
        $this->assertEquals($result->totalPayable, $sumTotal);
    }

    public function test_flat_loan_calculator_rounding_difference_allocated_to_last(): void
    {
        // 10.000.000 with 3 months, 10% rate
        // Total interest = round(10.000.000 * 0.1 * 3 / 12) = 250.000
        // Base principal = floor(10.000.000 / 3) = 3.333.333
        // Base interest = floor(250.000 / 3) = 83.333
        // Principal diff = 10.000.000 - 9.999.999 = 1
        // Interest diff = 250.000 - 249.999 = 1
        $result = FlatLoanCalculator::calculate(10000000, 10.0, 3, '2026-01-15');

        $this->assertEquals(3333333, $result->schedule[0]['principal_due']);
        $this->assertEquals(3333333, $result->schedule[1]['principal_due']);
        $this->assertEquals(3333334, $result->schedule[2]['principal_due']); // last installment gets diff

        $sumPrincipal = array_sum(array_column($result->schedule, 'principal_due'));
        $this->assertEquals(10000000, $sumPrincipal);
    }

    public function test_flat_loan_calculator_deductions_calculation(): void
    {
        // Plafon 10.000.000, 0.5% Dana Risiko (50.000), 0.5% Simpanan Wajib (50.000)
        $result = FlatLoanCalculator::calculate(10000000, 10.0, 12, '2026-01-15', 0.50, 0.50);

        $this->assertEquals(0.50, $result->riskFeePercentage);
        $this->assertEquals(0.50, $result->mandatorySavingPercentage);
        $this->assertEquals(50000, $result->riskFeeAmount);
        $this->assertEquals(50000, $result->mandatorySavingAmount);
        $this->assertEquals(9900000, $result->netDisbursementAmount);

        $this->assertEquals(10000000, $result->netDisbursementAmount + $result->riskFeeAmount + $result->mandatorySavingAmount);
    }
}
