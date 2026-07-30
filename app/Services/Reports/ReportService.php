<?php

declare(strict_types=1);

namespace App\Services\Reports;

use App\Models\Loan;
use App\Models\Member;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    /**
     * Get reconciled dashboard metrics.
     *
     * @return array{
     *   total_members: int,
     *   total_savings: int,
     *   total_outstanding_loans: int,
     *   total_active_loans: int
     * }
     */
    public function getDashboardMetrics(): array
    {
        return [
            'total_members' => Member::where('status', 'active')->count(),
            'total_savings' => (int) Member::sum('total_savings'),
            'total_outstanding_loans' => (int) Loan::where('status', 'active')->sum('outstanding_amount'),
            'total_active_loans' => Loan::where('status', 'active')->count(),
        ];
    }

    /**
     * Export members list as CSV.
     */
    public function exportMembersCsv(): StreamedResponse
    {
        $fileName = 'Laporan_Anggota_'.date('Ymd_His').'.csv';
        $members = Member::orderBy('member_no')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($members) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['No Anggota', 'Nama Lengkap', 'NIK KTP', 'Email', 'No HP', 'Tanggal Bergabung', 'Status', 'Total Simpanan']);

            foreach ($members as $m) {
                fputcsv($file, [
                    $m->member_no,
                    $m->full_name,
                    $m->identity_no,
                    $m->email,
                    $m->phone ?? '-',
                    $m->join_date?->format('Y-m-d'),
                    $m->status->value,
                    $m->total_savings,
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
