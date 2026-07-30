<?php

namespace App\Enums;

enum SavingsType: string
{
    case PRINCIPAL = 'principal';
    case MANDATORY = 'mandatory';
    case VOLUNTARY = 'voluntary';
}
