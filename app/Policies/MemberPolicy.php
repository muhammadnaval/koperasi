<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\Profile;

class MemberPolicy
{
    public function viewAny(Profile $profile): bool
    {
        return in_array($profile->role, [UserRole::STAFF, UserRole::APPROVER, UserRole::ADMIN]);
    }

    public function view(Profile $profile, Member $member): bool
    {
        if ($profile->role === UserRole::MEMBER) {
            return $member->profile_id === $profile->id;
        }

        return true;
    }

    public function create(Profile $profile): bool
    {
        return in_array($profile->role, [UserRole::STAFF, UserRole::ADMIN]);
    }

    public function update(Profile $profile, Member $member): bool
    {
        return in_array($profile->role, [UserRole::STAFF, UserRole::ADMIN]);
    }

    public function changeStatus(Profile $profile, Member $member): bool
    {
        return in_array($profile->role, [UserRole::STAFF, UserRole::ADMIN]);
    }
}
