<?php

namespace App\Http\Requests;

use App\Enums\SavingsTransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSavingsTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role->value, ['staff', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'uuid', 'exists:members,id'],
            'savings_product_id' => ['required', 'uuid', 'exists:savings_products,id'],
            'type' => ['required', new Enum(SavingsTransactionType::class)],
            'amount' => ['required', 'integer', 'min:1000'],
            'transaction_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
