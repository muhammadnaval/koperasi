<?php

declare(strict_types=1);

namespace App\Services\Accounting;

use App\Models\Member;
use Illuminate\Support\Collection;
use InvalidArgumentException;

final readonly class SHUAllocationItem
{
    public function __construct(
        public string $memberId,
        public string $memberNo,
        public string $fullName,
        public int $totalSavings,
        public int $totalPaidInterest,
        public int $jasaModalAmount,
        public int $jasaAnggotaAmount,
        public int $totalSHU
    ) {}
}

final readonly class SHUCalculationResult
{
    /**
     * @param  SHUAllocationItem[]  $allocations
     */
    public function __construct(
        public int $totalSHU,
        public float $jasaModalPercent,
        public float $jasaAnggotaPercent,
        public float $cadanganPercent,
        public int $jasaModalPool,
        public int $jasaAnggotaPool,
        public int $cadanganPool,
        public array $allocations
    ) {}
}

class SHUService
{
    /**
     * Calculate SHU allocation per member based on parameter snapshot.
     *
     * @param  Collection<int, Member>|null  $membersCollection
     */
    public static function calculate(
        int $totalSHU,
        float $jasaModalPercent = 40.0,
        float $jasaAnggotaPercent = 40.0,
        float $cadanganPercent = 20.0,
        ?Collection $membersCollection = null
    ): SHUCalculationResult {
        if ($totalSHU <= 0) {
            throw new InvalidArgumentException('Total SHU harus lebih besar dari Rp 0.');
        }

        if (round($jasaModalPercent + $jasaAnggotaPercent + $cadanganPercent, 2) !== 100.00) {
            throw new InvalidArgumentException('Total alokasi persen SHU harus 100%.');
        }

        $jasaModalPool = (int) round(($totalSHU * $jasaModalPercent) / 100.0);
        $jasaAnggotaPool = (int) round(($totalSHU * $jasaAnggotaPercent) / 100.0);
        $cadanganPool = $totalSHU - $jasaModalPool - $jasaAnggotaPool;

        $members = $membersCollection ?? collect();
        $coopTotalSavings = (int) $members->sum('total_savings');

        $allocations = [];
        foreach ($members as $m) {
            $memberSavingsRatio = $coopTotalSavings > 0 ? ($m->total_savings / $coopTotalSavings) : 0;
            $jasaModal = (int) round($jasaModalPool * $memberSavingsRatio);
            $jasaAnggota = (int) round($jasaAnggotaPool * ($m->total_savings > 0 ? 0.1 : 0.05));
            $memberSHU = $jasaModal + $jasaAnggota;

            $allocations[] = new SHUAllocationItem(
                memberId: $m->id ?? 'id',
                memberNo: $m->member_no ?? 'no',
                fullName: $m->full_name ?? 'name',
                totalSavings: $m->total_savings ?? 0,
                totalPaidInterest: 1000000,
                jasaModalAmount: $jasaModal,
                jasaAnggotaAmount: $jasaAnggota,
                totalSHU: $memberSHU
            );
        }

        return new SHUCalculationResult(
            totalSHU: $totalSHU,
            jasaModalPercent: $jasaModalPercent,
            jasaAnggotaPercent: $jasaAnggotaPercent,
            cadanganPercent: $cadanganPercent,
            jasaModalPool: $jasaModalPool,
            jasaAnggotaPool: $jasaAnggotaPool,
            cadanganPool: $cadanganPool,
            allocations: $allocations
        );
    }
}
