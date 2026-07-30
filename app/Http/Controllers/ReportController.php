<?php

namespace App\Http\Controllers;

use App\Services\Reports\KPIMonitoringService;
use App\Services\Reports\ReportService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
        private readonly KPIMonitoringService $kpiService
    ) {}

    public function index(): Response
    {
        $metrics = $this->reportService->getDashboardMetrics();
        $kpiMetrics = $this->kpiService->getKPIMetrics();

        return Inertia::render('Admin/Reports', [
            'metrics' => $metrics,
            'kpiMetrics' => $kpiMetrics,
        ]);
    }

    public function exportMembers(): StreamedResponse
    {
        return $this->reportService->exportMembersCsv();
    }
}
