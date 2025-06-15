<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, \Closure $next)
    {
        $user = auth()->user();
        $superAdminRole = \App\Models\Role::where('name', 'superadministrador')->first();

        if (!$user || !$superAdminRole || $user->role_id !== $superAdminRole->id) {
            abort(403, 'Acceso solo para superadministradores');
        }
        return $next($request);
    }
}
