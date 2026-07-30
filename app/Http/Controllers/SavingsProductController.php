<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavingsProductRequest;
use App\Models\AuditLog;
use App\Models\SavingsProduct;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SavingsProductController extends Controller
{
    public function index(): Response
    {
        $products = SavingsProduct::orderBy('code')->get();

        return Inertia::render('Admin/Products', [
            'savingsProducts' => $products,
        ]);
    }

    public function store(StoreSavingsProductRequest $request): RedirectResponse
    {
        $product = SavingsProduct::create($request->validated());

        AuditLog::create([
            'actor_name' => $request->user()?->name ?? 'Admin',
            'actor_role' => 'admin',
            'action' => 'CREATE_SAVINGS_PRODUCT',
            'entity_type' => 'SavingsProduct',
            'entity_id' => $product->code,
            'after' => $product->toArray(),
        ]);

        return back()->with('success', 'Produk simpanan berhasil ditambahkan.');
    }

    public function toggleActive(SavingsProduct $product): RedirectResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        return back()->with('success', 'Status produk simpanan berhasil diperbarui.');
    }
}
