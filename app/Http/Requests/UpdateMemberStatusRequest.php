<?php

namespace App\Http\Requests;

use App\Enums\MemberStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateMemberStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role->value, ['staff', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(MemberStatus::class)],
            'reason' => ['required', 'string', 'min:5'],
        ];
    }
}
