<?php

namespace App\Http\Controllers;

use App\Models\DocumentType;
use Illuminate\Http\Request;

class DocumentTypeController extends Controller
{
    // Lista todos los tipos de documento activos e inactivos
    public function index()
    {
        $actives = DocumentType::where('status', true)->get();
        $inactives = DocumentType::where('status', false)->get();
        return \Inertia\Inertia::render('TiposDocumento', [
            'documenttypes' => $actives,
            'inactives' => $inactives,
        ]);
    }

    // Crear un nuevo tipo de documento
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        // Buscar si ya existe un tipo de documento con ese nombre
        $existing = DocumentType::whereRaw('LOWER(name) = ?', [strtolower($request->name)])->first();
        if ($existing) {
            if ($existing->status) {
                return back()->withErrors(['name' => 'Ya existe un tipo de documento activo con ese nombre.']);
            } else {
                return back()->withErrors(['name' => 'Este tipo de documento ya existe pero está inactivo. Reactívalo para usarlo.']);
            }
        }

        // Crear el tipo de documento
        $documentType = DocumentType::create([
            'name' => $request->name,
            'status' => true,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('tipos-documento.index')->with('success', 'Tipo de documento creado correctamente.');
    }

    // Reactivar un tipo de documento inactivo
    public function reactivate($id)
    {
        $documentType = \App\Models\DocumentType::findOrFail($id);

        if ($documentType->status) {
            return back()->withErrors(['status' => 'El tipo de documento ya está activo.']);
        }

        $documentType->timestamps = false;
        $documentType->status = true;
        $documentType->save();

        return redirect()->route('tipos-documento.index')->with('success', 'Tipo de documento reactivado correctamente.');
    }

    // Actualizar un tipo de documento
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $documentType = DocumentType::findOrFail($id);

        if (!$documentType->status) {
            return back()->withErrors(['status' => 'No se puede editar un tipo de documento inactivo.']);
        }

        // Verificar si el nuevo nombre ya existe en otro tipo de documento activo
        $existing = DocumentType::where('name', $request->name)
            ->where('id', '!=', $id)
            ->where('status', true)
            ->first();

        if ($existing) {
            return back()->withErrors(['name' => 'Ya existe un tipo de documento activo con ese nombre.']);
        }

        $documentType->name = $request->name;
        $documentType->updated_by = auth()->id();
        $documentType->save();

        return redirect()->route('tipos-documento.index')->with('success', 'Tipo de documento actualizado correctamente.');
    }

    // Inactivar un tipo de documento
    public function destroy(string $id)
    {
        $documentType = DocumentType::findOrFail($id);

        if (!$documentType->status) {
            return back()->withErrors(['status' => 'El tipo de documento ya está inactivo.']);
        }

        $documentType->status = false;
        $documentType->inactivated_by = auth()->id();
        $documentType->inactivated_at = now();
        $documentType->timestamps = false;
        $documentType->save();

        // Redirige a la misma ruta para que Inertia recargue la página
        return redirect()->route('tipos-documento.index')->with('success', 'Tipo de documento inactivado correctamente.');
    }
}
