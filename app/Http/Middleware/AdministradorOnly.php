<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdministradorOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        $adminRole = \App\Models\Role::whereRaw('LOWER(name) = ?', ['administrador'])->first();

        if (!$user || !$adminRole || $user->role_id !== $adminRole->id) {
            abort(403, 'Acceso solo para administradores');
        }
        return $next($request);
    }
}
