<?php

namespace App\Enums;

enum LoanStatus: string
{
    case ACTIVE = 'active';
    case PAID_OFF = 'paid_off';
    case DELINQUENT = 'delinquent';
    case WRITTEN_OFF = 'written_off';
}
