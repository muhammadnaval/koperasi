<?php

declare(strict_types=1);

namespace Tests\Feature\Services;

use App\Enums\MemberStatus;
use App\Models\Member;
use App\Services\Members\MemberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_member_creates_pending_member(): void
    {
        $service = new MemberService;
        $member = $service->registerMember([
            'full_name' => 'Budi Santoso',
            'email' => 'budi.santoso@mtsn3padang.sch.id',
            'phone' => '081266778899',
            'identity_no' => '1371011508820001',
            'occupation' => 'Guru PNS',
            'address' => 'Jl. Sudirman Padang',
        ]);

        $this->assertInstanceOf(Member::class, $member);
        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'full_name' => 'Budi Santoso',
            'status' => 'pending',
        ]);
        $this->assertStringStartsWith('AGT-', $member->member_no);
    }

    public function test_update_member_status_updates_status_with_audit(): void
    {
        $service = new MemberService;
        $member = $service->registerMember([
            'full_name' => 'Siti Aminah',
            'email' => 'siti.aminah@mtsn3padang.sch.id',
            'identity_no' => '1371022204780003',
        ]);

        $updated = $service->updateMemberStatus($member->id, MemberStatus::ACTIVE, 'Verifikasi identitas lengkap');

        $this->assertEquals(MemberStatus::ACTIVE, $updated->status);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'UPDATE_MEMBER_STATUS',
            'entity_id' => $member->member_no,
        ]);
    }
}
