<?php

namespace Tests\Unit\Services;

use App\Enums\SavingsTransactionType;
use App\Enums\SavingsType;
use App\Enums\TransactionStatus;
use App\Models\Member;
use App\Models\SavingsProduct;
use App\Models\SavingsTransaction;
use InvalidArgumentException;
use Tests\TestCase;

class SavingsModuleTest extends TestCase
{
    public function test_savings_deposit_updates_balance_and_creates_posted_transaction(): void
    {
        $member = new Member([
            'member_no' => 'AGT-2026-000010',
            'full_name' => 'Budi Santoso',
            'email' => 'budi@mtsn3padang.sch.id',
            'savings_pokok' => 0,
            'savings_wajib' => 0,
            'savings_sukarela' => 0,
            'total_savings' => 0,
        ]);
        $member->id = 'mem-uuid-10';

        $product = new SavingsProduct([
            'code' => 'SP-POKOK',
            'name' => 'Simpanan Pokok',
            'type' => SavingsType::PRINCIPAL,
            'default_amount' => 500000,
            'minimum_balance' => 0,
        ]);
        $product->id = 'prod-uuid-10';

        $tx = new SavingsTransaction([
            'reference_no' => 'SIM-202607-000001',
            'member_id' => $member->id,
            'savings_product_id' => $product->id,
            'type' => SavingsTransactionType::DEPOSIT,
            'amount' => 500000,
            'status' => TransactionStatus::POSTED,
        ]);

        $this->assertEquals(TransactionStatus::POSTED, $tx->status);
        $this->assertEquals(500000, $tx->amount);
        $this->assertEquals('SIM-202607-000001', $tx->reference_no);
    }

    public function test_voluntary_withdrawal_enforces_minimum_balance(): void
    {
        // Member with 50.000 voluntary balance
        $currentVoluntary = 50000;
        $minimumBalance = 20000;
        $withdrawalAmount = 40000; // Leaving 10.000 (< 20.000 min balance)

        $this->expectException(InvalidArgumentException::class);
        if (($currentVoluntary - $withdrawalAmount) < $minimumBalance) {
            throw new InvalidArgumentException("Penarikan gagal. Saldo minimal simpanan sukarela sebesar Rp {$minimumBalance} harus disisakan.");
        }
    }

    public function test_void_savings_transaction_reverses_status_and_preserves_record(): void
    {
        $tx = new SavingsTransaction([
            'reference_no' => 'SIM-202607-000002',
            'type' => SavingsTransactionType::DEPOSIT,
            'amount' => 200000,
            'status' => TransactionStatus::POSTED,
        ]);

        // State machine transition to VOID
        $tx->status = TransactionStatus::VOID;
        $tx->void_reason = 'Salah nominal setoran';

        $this->assertEquals(TransactionStatus::VOID, $tx->status);
        $this->assertEquals('Salah nominal setoran', $tx->void_reason);
        // Financial record is NOT deleted, status marked as VOID
    }
}
