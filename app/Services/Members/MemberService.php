<?php

declare(strict_types=1);

namespace App\Services\Members;

use App\Enums\MemberStatus;
use App\Models\AuditLog;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

class MemberService
{
    /**
     * Register a new cooperative member.
     */
    public function registerMember(array $data, string $actorName = 'System'): Member
    {
        return DB::transaction(function () use ($data, $actorName) {
            $nextCount = Member::count() + 101;
            $memberNo = sprintf('AGT-%s-%06d', date('Y'), $nextCount);

            $member = Member::create([
                'member_no' => $memberNo,
                'profile_id' => $data['profile_id'] ?? null,
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'identity_no' => $data['identity_no'],
                'birth_date' => $data['birth_date'] ?? null,
                'join_date' => $data['join_date'] ?? date('Y-m-d'),
                'occupation' => $data['occupation'] ?? null,
                'address' => $data['address'] ?? null,
                'status' => MemberStatus::PENDING,
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'staff',
                'action' => 'REGISTER_MEMBER',
                'entity_type' => 'Member',
                'entity_id' => $member->member_no,
                'after' => $member->toArray(),
            ]);

            return $member;
        });
    }

    /**
     * Update status of member (active, suspended, inactive) with mandatory reason.
     */
    public function updateMemberStatus(string $memberId, MemberStatus $newStatus, string $reason, string $actorName = 'Admin'): Member
    {
        return DB::transaction(function () use ($memberId, $newStatus, $reason, $actorName) {
            /** @var Member $member */
            $member = Member::where('id', $memberId)->lockForUpdate()->firstOrFail();
            $oldStatus = $member->status;

            $member->update(['status' => $newStatus]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'admin',
                'action' => 'UPDATE_MEMBER_STATUS',
                'entity_type' => 'Member',
                'entity_id' => $member->member_no,
                'before' => ['status' => $oldStatus->value],
                'after' => ['status' => $newStatus->value, 'reason' => $reason],
            ]);

            return $member;
        });
    }
}
