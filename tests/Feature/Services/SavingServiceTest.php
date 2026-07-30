<?php

declare(strict_types=1);

namespace Tests\Feature\Services;

use App\Enums\SavingsTransactionType;
use App\Enums\SavingsType;
use App\Models\SavingsProduct;
use App\Services\Members\MemberService;
use App\Services\Savings\SavingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_savings_deposit_updates_balance(): void
    {
        $memberService = new MemberService;
        $member = $memberService->registerMember([
            'full_name' => 'Ratna Juwita',
            'email' => 'ratna.juwita@mtsn3padang.sch.id',
            'identity_no' => '1371055509920002',
        ]);

        $product = SavingsProduct::create([
            'code' => 'SP-POKOK',
            'name' => 'Simpanan Pokok',
            'type' => SavingsType::PRINCIPAL,
            'default_amount' => 500000,
            'minimum_balance' => 0,
        ]);

        $savingService = new SavingService;
        $tx = $savingService->postTransaction([
            'member_id' => $member->id,
            'savings_product_id' => $product->id,
            'type' => SavingsTransactionType::DEPOSIT,
            'amount' => 500000,
            'description' => 'Setoran Simpanan Pokok',
        ]);

        $this->assertDatabaseHas('savings_transactions', [
            'id' => $tx->id,
            'amount' => 500000,
            'status' => 'posted',
        ]);

        $freshMember = $member->fresh();
        $this->assertEquals(500000, $freshMember->savings_pokok);
        $this->assertEquals(500000, $freshMember->total_savings);
    }
}
