<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Queries\Reports\LoanReportQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $loans = LoanReportQuery::getQuery(
            status: $request->status,
            productId: $request->product_id
        )->paginate(15);

        return Inertia::render('Admin/Loans', [
            'loans' => $loans,
            'filters' => $request->only(['status', 'product_id']),
        ]);
    }

    public function show(Loan $loan): Response
    {
        $loan->load(['member', 'loanApplication', 'installments', 'payments.allocations']);

        return Inertia::render('Member/LoanDetail', [
            'loan' => $loan,
        ]);
    }
}
