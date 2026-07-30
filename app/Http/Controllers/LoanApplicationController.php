<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveLoanApplicationRequest;
use App\Http\Requests\DisburseLoanRequest;
use App\Http\Requests\StoreLoanApplicationRequest;
use App\Models\LoanApplication;
use App\Services\Loans\LoanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanApplicationController extends Controller
{
    public function __construct(private readonly LoanService $loanService) {}

    public function index(Request $request): Response
    {
        $applications = LoanApplication::query()
            ->with(['member', 'loanProduct'])
            ->when($request->status, fn ($q, $st) => $q->where('status', $st))
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Admin/LoanApplications', [
            'applications' => $applications,
            'filters' => $request->only(['status']),
        ]);
    }

    public function store(StoreLoanApplicationRequest $request): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Member';
        $app = $this->loanService->submitApplication($request->validated(), $actorName);

        return back()->with('success', "Pengajuan pinjaman {$app->application_no} berhasil dikirim.");
    }

    public function approve(ApproveLoanApplicationRequest $request, LoanApplication $application): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Approver';
        $this->loanService->approveApplication($application->id, $request->validated(), $actorName);

        return back()->with('success', "Pengajuan pinjaman {$application->application_no} berhasil disetujui.");
    }

    public function disburse(DisburseLoanRequest $request, LoanApplication $application): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Staff';
        $loan = $this->loanService->disburseLoan($application->id, $request->disbursement_date, $actorName);

        return back()->with('success', "Pinjaman {$loan->loan_no} berhasil dicairkan.");
    }
}
