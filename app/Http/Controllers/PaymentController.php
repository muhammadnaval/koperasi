<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\VoidPaymentRequest;
use App\Models\Payment;
use App\Services\Loans\InstallmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly InstallmentService $installmentService) {}

    public function index(Request $request): Response
    {
        $payments = Payment::query()
            ->with(['member', 'loan', 'allocations.installment'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Admin/Installments', [
            'payments' => $payments,
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Staff';
        $payment = $this->installmentService->postPayment($request->validated(), $actorName);

        return back()->with('success', "Pembayaran angsuran {$payment->payment_no} berhasil diposting.");
    }

    public function void(VoidPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Admin';
        $this->installmentService->voidPayment($payment->id, $request->reason, $actorName);

        return back()->with('success', "Pembayaran angsuran {$payment->payment_no} berhasil dibatalkan.");
    }
}
