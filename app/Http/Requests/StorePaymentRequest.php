<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role->value, ['staff', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'loan_id' => ['required', 'uuid', 'exists:loans,id'],
            'amount' => ['required', 'integer', 'min:1000'],
            'payment_date' => ['nullable', 'date'],
            'method' => ['nullable', 'string'],
            'reference' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
