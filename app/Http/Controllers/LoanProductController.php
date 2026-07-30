<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanProductRequest;
use App\Models\AuditLog;
use App\Models\LoanProduct;
use Illuminate\Http\RedirectResponse;

class LoanProductController extends Controller
{
    public function store(StoreLoanProductRequest $request): RedirectResponse
    {
        $product = LoanProduct::create($request->validated());

        AuditLog::create([
            'actor_name' => $request->user()?->name ?? 'Admin',
            'actor_role' => 'admin',
            'action' => 'CREATE_LOAN_PRODUCT',
            'entity_type' => 'LoanProduct',
            'entity_id' => $product->code,
            'after' => $product->toArray(),
        ]);

        return back()->with('success', 'Produk pinjaman berhasil ditambahkan.');
    }

    public function toggleActive(LoanProduct $product): RedirectResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        return back()->with('success', 'Status produk pinjaman berhasil diperbarui.');
    }
}
