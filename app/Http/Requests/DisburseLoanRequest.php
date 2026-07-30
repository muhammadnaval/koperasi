<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DisburseLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role->value, ['staff', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'disbursement_date' => ['required', 'date'],
        ];
    }
}
