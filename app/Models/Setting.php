<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasUuids;

    protected $fillable = [
        'key',
        'value',
        'group',
        'description',
    ];

    /**
     * Helper method to get setting value by key.
     */
    public static function getByKey(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (! $setting) {
            return $default;
        }

        $val = $setting->value;
        if ($val === 'true') {
            return true;
        }
        if ($val === 'false') {
            return false;
        }
        if (is_numeric($val)) {
            return $val + 0;
        }

        return $val;
    }

    /**
     * Helper method to set setting value by key.
     */
    public static function setByKey(string $key, mixed $value, string $group = 'general', ?string $description = null): static
    {
        $stringValue = is_bool($value) ? ($value ? 'true' : 'false') : (string) $value;

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $stringValue,
                'group' => $group,
                'description' => $description,
            ]
        );
    }
}
