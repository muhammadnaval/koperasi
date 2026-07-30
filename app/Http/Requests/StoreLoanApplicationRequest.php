<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role->value === 'member';
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'uuid', 'exists:members,id'],
            'loan_product_id' => ['required', 'uuid', 'exists:loan_products,id'],
            'requested_amount' => ['required', 'integer', 'min:500000'],
            'requested_term_months' => ['required', 'integer', 'min:1', 'max:60'],
            'purpose' => ['required', 'string', 'min:10'],
            'attachments' => ['nullable', 'array'],
        ];
    }
}
