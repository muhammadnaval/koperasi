<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role->value, ['approver', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'approved_amount' => ['nullable', 'integer', 'min:500000'],
            'approved_term_months' => ['nullable', 'integer', 'min:1', 'max:60'],
            'approved_annual_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'decision_reason' => ['nullable', 'string'],
        ];
    }
}
