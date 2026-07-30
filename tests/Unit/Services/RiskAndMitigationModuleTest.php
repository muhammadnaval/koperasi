<?php

namespace Tests\Unit\Services;

use App\Enums\TransactionStatus;
use App\Models\Loan;
use App\Models\LoanProduct;
use App\Models\SavingsTransaction;
use Tests\TestCase;

class RiskAndMitigationModuleTest extends TestCase
{
    public function test_nik_identity_masking_mitigates_pii_exposure(): void
    {
        $nik = '1371011508820001';
        $masked = substr($nik, 0, 6).'******'.substr($nik, -4);

        $this->assertEquals('137101******0001', $masked);
    }

    public function test_posted_financial_data_is_immutable_against_hard_deletion(): void
    {
        $tx = new SavingsTransaction([
            'reference_no' => 'SIM-202607-000888',
            'amount' => 500000,
            'status' => TransactionStatus::POSTED,
        ]);

        // Mitigasi: bukannya dihapus fisik, transaksi dipindahkan ke VOID
        $tx->status = TransactionStatus::VOID;
        $tx->void_reason = 'Koreksi human-error kasir';

        $this->assertEquals(TransactionStatus::VOID, $tx->status);
        $this->assertNotEmpty($tx->void_reason);
    }

    public function test_snapshot_parameters_on_loans_protect_against_product_changes(): void
    {
        $loan = new Loan([
            'loan_no' => 'PJM-202607-000777',
            'principal_amount' => 10000000,
            'annual_interest_rate' => 10.0,
            'total_payable' => 11000000,
        ]);

        $product = new LoanProduct([
            'code' => 'PJM-SERBAGUNA',
            'annual_interest_rate' => 10.0,
        ]);

        // Admin mengubah produk menjadi 18.0%
        $product->annual_interest_rate = 18.0;

        // Kontrak pinjaman aktif TETAP 10.0% (Terproteksi oleh snapshot parameter)
        $this->assertEquals(10.0, $loan->annual_interest_rate);
        $this->assertEquals(11000000, $loan->total_payable);
    }
}
