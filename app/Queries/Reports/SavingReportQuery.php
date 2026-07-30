<?php

declare(strict_types=1);

namespace App\Queries\Reports;

use App\Models\SavingsTransaction;
use Illuminate\Database\Eloquent\Builder;

class SavingReportQuery
{
    /**
     * Get filtered savings transactions query object.
     */
    public static function getQuery(?string $productId = null, ?string $status = null, ?string $startDate = null, ?string $endDate = null): Builder
    {
        return SavingsTransaction::query()
            ->with(['member', 'savingsProduct'])
            ->when($productId, fn ($q) => $q->where('savings_product_id', $productId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($startDate, fn ($q) => $q->whereDate('transaction_date', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('transaction_date', '<=', $endDate))
            ->orderByDesc('created_at');
    }
}
