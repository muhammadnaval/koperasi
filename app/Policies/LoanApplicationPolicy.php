<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\LoanApplication;
use App\Models\Profile;

class LoanApplicationPolicy
{
    public function viewAny(Profile $profile): bool
    {
        return true;
    }

    public function view(Profile $profile, LoanApplication $application): bool
    {
        if ($profile->role === UserRole::MEMBER) {
            return $application->member->profile_id === $profile->id;
        }

        return true;
    }

    public function create(Profile $profile): bool
    {
        return $profile->role === UserRole::MEMBER && $profile->status->value === 'active';
    }

    public function review(Profile $profile, LoanApplication $application): bool
    {
        return in_array($profile->role, [UserRole::STAFF, UserRole::ADMIN]);
    }

    public function approve(Profile $profile, LoanApplication $application): bool
    {
        return in_array($profile->role, [UserRole::APPROVER, UserRole::ADMIN]);
    }

    public function disburse(Profile $profile, LoanApplication $application): bool
    {
        return in_array($profile->role, [UserRole::STAFF, UserRole::ADMIN]);
    }
}
