<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/home-superadministrador', function () {
    return Inertia::render('HomeSuperAdministrador');
})->middleware(['auth', 'verified', 'superadmin'])->name('home.superadministrador');

Route::get('/home-administrador', function () {
    return Inertia::render('HomeAdministrador');
})->middleware(['auth', 'verified', 'administrador'])->name('home.administrador');

Route::get('/home-usuario', function () {
    return Inertia::render('HomeUsuario');
})->middleware(['auth', 'verified', 'usuario'])->name('home.usuario');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::middleware(['auth', 'superadmin'])->group(function () {
    Route::resource('usuarios', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('tipos-documento', DocumentTypeController::class);

    // Rutas personalizadas para métodos extra en usuarios
    Route::post('/usuarios/{id}/reactivate', [UserController::class, 'reactivate'])
    ->name('usuarios.reactivate')
    ->middleware(['auth', 'superadmin']);

    // Rutas personalizadas para métodos extra en tipos de documento:
    Route::get('tipos-documento-inactivos', [DocumentTypeController::class, 'inactives'])
        ->name('tipos-documento.inactivos');

    Route::post('tipos-documento/{id}/reactivate', [DocumentTypeController::class, 'reactivate'])
        ->name('tipos-documento.reactivate');

    // Rutas personalizadas para métodos extra en roles
    Route::get('roles-inactivos', [RoleController::class, 'inactives'])
        ->name('roles.inactivos');
    Route::post('roles/{id}/reactivate', [RoleController::class, 'reactivate'])
        ->name('roles.reactivate');

});
