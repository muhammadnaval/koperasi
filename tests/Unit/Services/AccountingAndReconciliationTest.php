<?php

namespace Tests\Unit\Services;

use App\Services\Accounting\JournalService;
use App\Services\Accounting\SHUService;
use InvalidArgumentException;
use Tests\TestCase;

class AccountingAndReconciliationTest extends TestCase
{
    public function test_journal_service_enforces_balanced_entries(): void
    {
        $service = new JournalService;

        $this->expectException(InvalidArgumentException::class);

        // Unbalanced entry (Debit 500.000 != Credit 400.000)
        $service->postJournal([
            'description' => 'Setoran Simpanan Unbalanced',
            'source_type' => 'test',
            'source_id' => 'test-001',
            'lines' => [
                ['account_code' => '1010-KAS', 'debit' => 500000, 'credit' => 0],
                ['account_code' => '2010-SIMPANAN', 'debit' => 0, 'credit' => 400000],
            ],
        ]);
    }

    public function test_shu_calculation_allocates_percentages_correctly(): void
    {
        $totalSHU = 100000000; // 100 Juta
        $calc = SHUService::calculate($totalSHU, 40.0, 40.0, 20.0);

        $this->assertEquals(100000000, $calc->totalSHU);
        $this->assertEquals(40000000, $calc->jasaModalPool); // 40%
        $this->assertEquals(40000000, $calc->jasaAnggotaPool); // 40%
        $this->assertEquals(20000000, $calc->cadanganPool); // 20%
    }
}
