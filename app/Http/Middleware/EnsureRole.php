<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->profile) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized access.'], 403);
            }

            return redirect()->route('unauthorized');
        }

        $userRole = $user->profile->role->value ?? null;

        if (! in_array($userRole, $roles, true)) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Forbidden: Insufficient privileges.'], 403);
            }

            return redirect()->route('unauthorized');
        }

        return $next($request);
    }
}
