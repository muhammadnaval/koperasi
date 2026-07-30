<?php

namespace Tests\Unit\Authorization;

use App\Enums\MemberStatus;
use App\Enums\UserRole;
use App\Models\Member;
use App\Models\Profile;
use App\Policies\MemberPolicy;
use Tests\TestCase;

class DataIsolationTest extends TestCase
{
    public function test_member_a_cannot_view_or_update_member_b_profile(): void
    {
        // 1. Setup Profile A & Member A
        $profileA = new Profile([
            'full_name' => 'Budi Santoso',
            'email' => 'budi.a@mtsn3padang.sch.id',
            'role' => UserRole::MEMBER,
            'status' => 'active',
        ]);
        $profileA->id = 'prof-uuid-a';

        $memberA = new Member([
            'member_no' => 'AGT-2026-000001',
            'profile_id' => 'prof-uuid-a',
            'full_name' => 'Budi Santoso',
            'email' => 'budi.a@mtsn3padang.sch.id',
            'status' => MemberStatus::ACTIVE,
        ]);
        $memberA->id = 'mem-uuid-a';

        // 2. Setup Profile B & Member B
        $profileB = new Profile([
            'full_name' => 'Ratna Juwita',
            'email' => 'ratna.b@mtsn3padang.sch.id',
            'role' => UserRole::MEMBER,
            'status' => 'active',
        ]);
        $profileB->id = 'prof-uuid-b';

        $memberB = new Member([
            'member_no' => 'AGT-2026-000002',
            'profile_id' => 'prof-uuid-b',
            'full_name' => 'Ratna Juwita',
            'email' => 'ratna.b@mtsn3padang.sch.id',
            'status' => MemberStatus::ACTIVE,
        ]);
        $memberB->id = 'mem-uuid-b';

        $policy = new MemberPolicy;

        // Member A CAN view Member A
        $this->assertTrue($policy->view($profileA, $memberA));

        // Member A CANNOT view Member B (Proven Isolation)
        $this->assertFalse($policy->view($profileA, $memberB));

        // Member A CANNOT view all members list
        $this->assertFalse($policy->viewAny($profileA));

        // Member A CANNOT update Member B profile
        $this->assertFalse($policy->update($profileA, $memberB));
    }

    public function test_staff_and_admin_can_view_any_member(): void
    {
        $staffProfile = new Profile([
            'full_name' => 'Siti Staff',
            'email' => 'staff@mtsn3padang.sch.id',
            'role' => UserRole::STAFF,
            'status' => 'active',
        ]);

        $member = new Member([
            'member_no' => 'AGT-2026-000003',
            'full_name' => 'Member C',
            'email' => 'member.c@mtsn3padang.sch.id',
            'status' => MemberStatus::ACTIVE,
        ]);

        $policy = new MemberPolicy;

        $this->assertTrue($policy->viewAny($staffProfile));
        $this->assertTrue($policy->view($staffProfile, $member));
        $this->assertTrue($policy->update($staffProfile, $member));
    }
}
