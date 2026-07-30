<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\LoanProduct;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $penaltySettings = [
            'gracePeriodDays' => (int) Setting::getByKey('loan_penalty_grace_period_days', 3),
            'lateFeePercentage' => (float) Setting::getByKey('loan_penalty_late_fee_percentage', 0.13),
            'lateFeeCalculationType' => (string) Setting::getByKey('loan_penalty_calculation_type', 'percent_of_interest'),
            'enableAutoPenalty' => (bool) Setting::getByKey('loan_penalty_enable_auto', true),
            'lateFeeAccountCode' => (string) Setting::getByKey('loan_penalty_account_code', '4020-PENDAPATAN-DENDA'),
        ];

        $loanProducts = LoanProduct::orderBy('code')->get();

        return Inertia::render('Admin/Settings', [
            'penaltySettings' => $penaltySettings,
            'loanProducts' => $loanProducts,
        ]);
    }

    public function updatePenaltySettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grace_period_days' => ['required', 'integer', 'min:0', 'max:90'],
            'late_fee_percentage' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'late_fee_calculation_type' => ['required', 'string', 'in:percent_of_interest,percent_of_installment,flat_per_day'],
            'enable_auto_penalty' => ['required', 'boolean'],
            'late_fee_account_code' => ['required', 'string', 'max:50'],
        ]);

        Setting::setByKey('loan_penalty_grace_period_days', $validated['grace_period_days'], 'loan_penalty', 'Masa tenggang denda keterlambatan (hari)');
        Setting::setByKey('loan_penalty_late_fee_percentage', $validated['late_fee_percentage'], 'loan_penalty', 'Persentase/Nominal denda keterlambatan');
        Setting::setByKey('loan_penalty_calculation_type', $validated['late_fee_calculation_type'], 'loan_penalty', 'Metode/Basis perhitungan denda');
        Setting::setByKey('loan_penalty_enable_auto', $validated['enable_auto_penalty'], 'loan_penalty', 'Otomatisasi pembebanan denda keterlambatan');
        Setting::setByKey('loan_penalty_account_code', $validated['late_fee_account_code'], 'loan_penalty', 'Kode akun pendapatan denda');

        AuditLog::create([
            'actor_name' => $request->user()?->name ?? 'Admin System',
            'actor_role' => 'admin',
            'action' => 'UPDATE_PENALTY_SETTINGS',
            'entity_type' => 'Setting',
            'entity_id' => 'loan_penalty',
            'after' => $validated,
        ]);

        return back()->with('success', 'Pengaturan denda dan masa tenggang (grace period) berhasil diperbarui.');
    }
}
