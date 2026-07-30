<?php

namespace App\Enums;

enum UserRole: string
{
    case MEMBER = 'member';
    case STAFF = 'staff';
    case APPROVER = 'approver';
    case ADMIN = 'admin';
}
