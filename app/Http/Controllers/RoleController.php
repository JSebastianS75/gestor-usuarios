<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RoleController extends Controller
{
    // Lista todos los roles activos
    public function index()
    {
        $actives = Role::where('status', true)->get();
        return response()->json(['roles' => $actives]);
    }
    // Lista todos los roles inactivos
    public function inactives()
    {
        $inactives = Role::where('status', false)->get();
        return response()->json(['roles' => $inactives]);
    }
    
    // Crear un nuevo rol
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $existing = Role::where('name', $request->name)->first();

        if ($existing) {
            if ($existing->status) {
                return back()->withErrors(['name' => 'Ya existe un rol activo con ese nombre.']);
            } else {
                return back()->withErrors(['name' => 'Este rol ya existe pero está inactivo. ¿Desea reactivarlo?']);
            }
        }

        $role = Role::create([
            'name' => $request->name,
            'status' => true,
            'created_by' => auth()->id(),
        ]);

        return response()->json(['success' => true, 'role' => $role]);
    }

    // Reactivar un rol inactivo
    public function reactivate($id)
    {
        $role = Role::findOrFail($id);

        if ($role->status) {
            return back()->withErrors(['status' => 'El rol ya está activo.']);
        }

        $role->status = true;
        $role->updated_by = auth()->id();
        $role->save();

        return response()->json(['success' => true, 'role' => $role]);
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

        return response()->json(['success' => true, 'role' => $role]);
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
        $role->save();

        return response()->json(['success' => true, 'role' => $role]);
    }
}
