<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavingsTransactionRequest;
use App\Http\Requests\VoidSavingsTransactionRequest;
use App\Models\SavingsProduct;
use App\Models\SavingsTransaction;
use App\Queries\Reports\SavingReportQuery;
use App\Services\Savings\SavingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingsTransactionController extends Controller
{
    public function __construct(private readonly SavingService $savingService) {}

    public function index(Request $request): Response
    {
        $transactions = SavingReportQuery::getQuery(
            productId: $request->product_id,
            status: $request->status,
            startDate: $request->start_date,
            endDate: $request->end_date
        )->paginate(15);

        $products = SavingsProduct::where('is_active', true)->get();

        return Inertia::render('Admin/Savings', [
            'transactions' => $transactions,
            'products' => $products,
            'filters' => $request->only(['product_id', 'status', 'start_date', 'end_date']),
        ]);
    }

    public function store(StoreSavingsTransactionRequest $request): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Staff';
        $tx = $this->savingService->postTransaction($request->validated(), $actorName);

        return back()->with('success', "Transaksi {$tx->reference_no} berhasil diposting.");
    }

    public function void(VoidSavingsTransactionRequest $request, SavingsTransaction $transaction): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Admin';
        $this->savingService->voidTransaction($transaction->id, $request->reason, $actorName);

        return back()->with('success', "Transaksi {$transaction->reference_no} berhasil dibatalkan (void).");
    }

    public function receipt(SavingsTransaction $transaction): Response
    {
        $transaction->load(['member', 'savingsProduct']);

        return Inertia::render('Member/SavingsReceipt', [
            'transaction' => $transaction,
        ]);
    }
}
