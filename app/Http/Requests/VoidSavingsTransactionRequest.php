<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoidSavingsTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role->value === 'admin';
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5'],
        ];
    }
}
