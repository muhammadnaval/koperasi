<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Services\Accounting\JournalService;
use App\Services\Accounting\SHUService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingController extends Controller
{
    public function __construct(
        private readonly JournalService $journalService
    ) {}

    public function index(Request $request): Response
    {
        $journals = JournalEntry::query()
            ->with('lines.account')
            ->orderByDesc('entry_date')
            ->paginate(15);

        $trialBalance = $this->journalService->getTrialBalance();

        return Inertia::render('Admin/Accounting', [
            'journals' => $journals,
            'trialBalance' => $trialBalance,
        ]);
    }

    public function shu(Request $request): Response
    {
        $totalSHU = (int) $request->input('total_shu', 50000000);
        $shuResult = SHUService::calculate($totalSHU);

        return Inertia::render('Admin/Accounting', [
            'shuResult' => $shuResult,
        ]);
    }
}
