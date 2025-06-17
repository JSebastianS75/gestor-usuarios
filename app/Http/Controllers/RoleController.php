<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // Listar roles activos e inactivos
    public function index()
    {
        $actives = Role::where('status', true)->get();
        $inactives = Role::where('status', false)->get();
        return \Inertia\Inertia::render('Roles', [
            'roles' => $actives,
            'inactives' => $inactives,
        ]);
    }
    
    // Crear un nuevo rol
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $existing = Role::whereRaw('LOWER(name) = ?', [strtolower($request->name)])->first();

        if ($existing) {
            if ($existing->status) {
                return back()->withErrors(['name' => 'Ya existe un rol activo con ese nombre.']);
            } else {
                return back()->withErrors(['name' => 'Este rol ya existe pero está inactivo. Reactívalo para usarlo.']);
            }
        }

        $role = Role::create([
            'name' => $request->name,
            'status' => true,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('roles.index')->with('success', 'Rol creado correctamente.');
    }

    // Reactivar un rol inactivo
    public function reactivate($id)
    {
        $role = Role::findOrFail($id);

        if ($role->status) {
            return back()->withErrors(['status' => 'El rol ya está activo.']);
        }

        $role->timestamps = false;
        $role->status = true;
        $role->save();

        return redirect()->route('roles.index')->with('success', 'Rol reactivado correctamente.');
    }


    // Actualizar un rol activo
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $role = Role::findOrFail($id);

        if (!$role->status) {
            return back()->withErrors(['status' => 'No se puede editar un rol inactivo.']);
        }

        // Verificar si el nuevo nombre ya existe en otro rol activo
        $existing = Role::where('name', $request->name)
            ->where('id', '!=', $id)
            ->where('status', true)
            ->first();

        if ($existing) {
            return back()->withErrors(['name' => 'Ya existe un rol activo con ese nombre.']);
        }

        $role->name = $request->name;
        $role->updated_by = auth()->id();
        $role->save();

        return redirect()->route('roles.index')->with('success', 'Rol actualizado correctamente.');
    }

    // Inactivar un rol
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);

        if (!$role->status) {
            return back()->withErrors(['status' => 'El rol ya está inactivo.']);
        }

        $role->status = false;
        $role->inactivated_by = auth()->id();
        $role->inactivated_at = now();
        $role->timestamps = false;
        $role->save();

        return redirect()->route('roles.index')->with('success', 'Rol inactivado correctamente.');
    }
}
