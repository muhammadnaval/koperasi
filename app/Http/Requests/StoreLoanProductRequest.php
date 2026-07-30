<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role->value === 'admin';
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:loan_products,code'],
            'name' => ['required', 'string', 'max:255'],
            'min_amount' => ['required', 'integer', 'min:100000'],
            'max_amount' => ['required', 'integer', 'gte:min_amount'],
            'min_term_months' => ['required', 'integer', 'min:1'],
            'max_term_months' => ['required', 'integer', 'gte:min_term_months'],
            'annual_interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'late_fee_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'risk_fee_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'mandatory_saving_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grace_period_days' => ['nullable', 'integer', 'min:0', 'max:90'],
            'late_fee_type' => ['nullable', 'string', 'in:percent_of_interest,percent_of_installment,flat_per_day'],
            'description' => ['nullable', 'string'],
        ];
    }
}
