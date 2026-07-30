<?php

namespace App\Http\Requests;

use App\Enums\SavingsType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSavingsProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role->value === 'admin';
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:savings_products,code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', new Enum(SavingsType::class)],
            'default_amount' => ['required', 'integer', 'min:0'],
            'minimum_balance' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ];
    }
}
