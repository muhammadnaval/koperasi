<?php

use App\Http\Controllers\AccountingController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\LoanProductController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SavingsProductController;
use App\Http\Controllers\SavingsTransactionController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Auth Routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login/otp', [LoginController::class, 'sendOtp'])->name('login.otp');
Route::post('/login/verify', [LoginController::class, 'verifyOtp'])->name('login.verify');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::get('/unauthorized', fn () => Inertia::render('Auth/Unauthorized'))->name('unauthorized');

// Redirect root
Route::get('/', fn () => redirect()->route('dashboard'));

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Member Views
    Route::get('/dashboard', fn () => Inertia::render('Member/Dashboard'))->name('dashboard');
    Route::get('/profil', fn () => Inertia::render('Member/Profile'))->name('member.profile');
    Route::get('/simpanan', [SavingsTransactionController::class, 'index'])->name('member.savings');
    Route::get('/simpanan/bukti/{transaction}', [SavingsTransactionController::class, 'receipt'])->name('member.savings.receipt');

    Route::get('/pinjaman', [LoanController::class, 'index'])->name('member.loans');
    Route::get('/pinjaman/ajukan', fn () => Inertia::render('Member/LoanApply'))->name('member.loans.apply');
    Route::post('/pinjaman/ajukan', [LoanApplicationController::class, 'store'])->name('member.loans.store');
    Route::get('/pinjaman/{loan}', [LoanController::class, 'show'])->name('member.loans.detail');

    // Staff / Approver / Admin Routes
    Route::middleware(['role:staff,approver,admin'])->prefix('admin')->group(function () {
        Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');

        // Members Management
        Route::get('/anggota', [MemberController::class, 'index'])->name('admin.members');
        Route::post('/anggota', [MemberController::class, 'store'])->name('admin.members.store');
        Route::post('/anggota/{member}/status', [MemberController::class, 'updateStatus'])->name('admin.members.update-status');

        // Savings Management
        Route::get('/simpanan', [SavingsTransactionController::class, 'index'])->name('admin.savings');
        Route::post('/simpanan', [SavingsTransactionController::class, 'store'])->name('admin.savings.store');
        Route::post('/simpanan/{transaction}/void', [SavingsTransactionController::class, 'void'])->name('admin.savings.void');

        // Loan Applications & Workflow
        Route::get('/pengajuan', [LoanApplicationController::class, 'index'])->name('admin.applications');
        Route::post('/pengajuan/{application}/approve', [LoanApplicationController::class, 'approve'])->name('admin.applications.approve');
        Route::post('/pengajuan/{application}/disburse', [LoanApplicationController::class, 'disburse'])->name('admin.applications.disburse');

        // Loans & Installments Management
        Route::get('/pinjaman', [LoanController::class, 'index'])->name('admin.loans');
        Route::get('/angsuran', [PaymentController::class, 'index'])->name('admin.installments');
        Route::post('/angsuran', [PaymentController::class, 'store'])->name('admin.installments.store');
        Route::post('/angsuran/{payment}/void', [PaymentController::class, 'void'])->name('admin.installments.void');

        // Accounting (General Ledger, Trial Balance, SHU)
        Route::get('/akuntansi', [AccountingController::class, 'index'])->name('admin.accounting');
        Route::get('/akuntansi/shu', [AccountingController::class, 'shu'])->name('admin.accounting.shu');

        // Reports & CSV Export
        Route::get('/laporan', [ReportController::class, 'index'])->name('admin.reports');
        Route::get('/laporan/ekspor/anggota', [ReportController::class, 'exportMembers'])->name('admin.reports.export.members');

        // Products Management (Admin only)
        Route::middleware(['role:admin'])->group(function () {
            Route::get('/produk', [SavingsProductController::class, 'index'])->name('admin.products');
            Route::post('/produk/simpanan', [SavingsProductController::class, 'store'])->name('admin.products.savings.store');
            Route::post('/produk/simpanan/{product}/toggle', [SavingsProductController::class, 'toggleActive'])->name('admin.products.savings.toggle');
            Route::post('/produk/pinjaman', [LoanProductController::class, 'store'])->name('admin.products.loans.store');
            Route::post('/produk/pinjaman/{product}/toggle', [LoanProductController::class, 'toggleActive'])->name('admin.products.loans.toggle');
            // Settings (Denda & Grace Period)
            Route::get('/pengaturan', [SettingController::class, 'index'])->name('admin.settings');
            Route::post('/pengaturan/denda', [SettingController::class, 'updatePenaltySettings'])->name('admin.settings.penalty.update');
        });

        Route::get('/pengguna', fn () => Inertia::render('Admin/Users'))->name('admin.users');
        Route::get('/audit-log', fn () => Inertia::render('Admin/AuditLog'))->name('admin.audit-log');
    });
});
