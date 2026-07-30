<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function showLoginForm(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function sendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $throttleKey = 'send-otp:'.strtolower($request->input('email'));
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => ["Terlalu banyak percobaan. Coba lagi dalam {$seconds} detik."],
            ]);
        }
        RateLimiter::hit($throttleKey);

        return back()->with('success', 'Kode OTP demo berhasil dikirim.');
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            $user = User::create([
                'name' => explode('@', $request->email)[0],
                'email' => $request->email,
                'password' => bcrypt('secret123'),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'full_name' => $user->name,
                'email' => $user->email,
                'role' => $request->input('role', 'member'),
                'status' => 'active',
            ]);
        } else {
            // Update profile role if existing for demo simulation
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'role' => $request->input('role', 'member'),
                    'status' => 'active',
                ]
            );
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        $role = $user->profile?->role?->value ?? 'member';

        return redirect()->intended($role === 'member' ? route('dashboard') : route('admin.dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
