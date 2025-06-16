<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UsuarioOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        $userRole = \App\Models\Role::whereRaw('LOWER(name) = ?', ['usuario'])->first();

        if (!$user || !$userRole || $user->role_id !== $userRole->id) {
            abort(403, 'Acceso solo para usuarios');
        }
        return $next($request);
        }
}
