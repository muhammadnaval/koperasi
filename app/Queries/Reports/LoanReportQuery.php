<?php

declare(strict_types=1);

namespace App\Queries\Reports;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Builder;

class LoanReportQuery
{
    /**
     * Get filtered loans query object.
     */
    public static function getQuery(?string $status = null, ?string $productId = null): Builder
    {
        return Loan::query()
            ->with(['member', 'installments'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($productId, fn ($q) => $q->where('loan_product_id', $productId))
            ->orderByDesc('created_at');
    }
}
