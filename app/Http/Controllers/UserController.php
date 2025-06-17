<?php

namespace App\Http\Controllers;

use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Crypt\RSA;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'login'              => 'required|string|max:40|unique:users,login',
            'first_name'         => 'required|string|max:100',
            'last_name'          => 'required|string|max:100',
            'document_type_id'   => 'required|exists:document_types,id',
            'document_number'    => 'required|string|max:30|unique:users,document_number',
            'gender'             => 'required|in:M,F,O',
            'email'              => 'required|string|email|max:255|unique:users,email',
            'mobile_phone'       => 'required|string|max:20',
            'role_id'            => 'required|exists:roles,id',
            'birth_date'         => 'required|date|before:today',
            'photo'              => 'nullable|image|max:2048',
            'password'           => ['required', 'confirmed', 'string', 'max:200'],
        ]);

        // Validar máximo dos superadministradores activos
        $superAdminRole = \App\Models\Role::whereRaw('LOWER(name) = ?', ['superadministrador'])->first();
        if ($superAdminRole && $request->role_id == $superAdminRole->id) {
            $superAdminsCount = \App\Models\User::where('role_id', $superAdminRole->id)
                ->where('status', true) 
                ->count();

            if ($superAdminsCount >= 2) {
                return back()->withErrors(['role_id' => 'Solo puede haber dos superadministradores activos.'])->withInput();
            }
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos', 'public');
        }

        // Cifrado RSA del password
        $publicKey = file_get_contents(storage_path('app/keys/public.pem'));
        $rsa = PublicKeyLoader::load($publicKey)->withPadding(RSA::ENCRYPTION_PKCS1);
        $encryptedPassword = base64_encode($rsa->encrypt($request->password));

        $user = User::create([
            'login'              => strtolower($request->login),
            'first_name'         => $request->first_name,
            'last_name'          => $request->last_name,
            'document_type_id'   => $request->document_type_id,
            'document_number'    => $request->document_number,
            'gender'             => $request->gender,
            'email'              => $request->email,
            'mobile_phone'       => $request->mobile_phone,
            'role_id'            => $request->role_id,
            'birth_date'         => $request->birth_date,
            'photo'              => $photoPath,
            'password'           => $encryptedPassword,
            'status'             => true, // Usuario activo por defecto
            'created_by'         => auth()->id(), // <-- Auditoría: quién creó el usuario
        ]);

        return redirect()->back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'login'              => 'required|string|max:40|unique:users,login,' . $id,
            'first_name'         => 'required|string|max:100',
            'last_name'          => 'required|string|max:100',
            'document_type_id'   => 'required|exists:document_types,id',
            'document_number'    => 'required|string|max:30|unique:users,document_number,' . $id,
            'gender'             => 'required|in:M,F,O',
            'email'              => 'required|string|email|max:255|unique:users,email,' . $id,
            'mobile_phone'       => 'required|string|max:20',
            'role_id'            => 'required|exists:roles,id',
            'birth_date'         => 'required|date|before:today',
            'photo'              => 'nullable|image|max:2048',
            // No pedimos password aquí por defecto
        ]);

        // Validar máximo dos superadministradores activos (excluyendo el usuario editado)
        $superAdminRole = \App\Models\Role::whereRaw('LOWER(name) = ?', ['superadministrador'])->first();
        if ($superAdminRole && $request->role_id == $superAdminRole->id) {
            $superAdminsCount = \App\Models\User::where('role_id', $superAdminRole->id)
                ->where('status', true)
                ->where('id', '!=', $id)
                ->count();

            if ($superAdminsCount >= 2) {
                return back()->withErrors(['role_id' => 'Solo puede haber dos superadministradores activos.'])->withInput();
            }
        }

        $user = User::findOrFail($id);

        // Actualizar foto si se envía una nueva
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos', 'public');
            $user->photo = $photoPath;
        }

        // Si se envía una nueva contraseña, cifrarla con RSA
        if ($request->filled('password')) {
            $publicKey = file_get_contents(storage_path('app/keys/public.pem'));
            $rsa = \phpseclib3\Crypt\PublicKeyLoader::load($publicKey)->withPadding(\phpseclib3\Crypt\RSA::ENCRYPTION_PKCS1);
            $encryptedPassword = base64_encode($rsa->encrypt($request->password));
            $user->password = $encryptedPassword;
        }

        // Actualizar otros campos
        $user->login              = strtolower($request->login);
        $user->first_name         = $request->first_name;
        $user->last_name          = $request->last_name;
        $user->document_type_id   = $request->document_type_id;
        $user->document_number    = $request->document_number;
        $user->gender             = $request->gender;
        $user->email              = $request->email;
        $user->mobile_phone       = $request->mobile_phone;
        $user->role_id            = $request->role_id;
        $user->birth_date         = $request->birth_date;

        // Auditoría: quién editó
        $user->updated_by = auth()->id();

        $user->save();

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }


    public function destroy($id)
    {
        $user = \App\Models\User::findOrFail($id);

        // Solo se puede inactivar si el usuario está activo
        if (!$user->status) {
            return back()->withErrors(['status' => 'El usuario ya está inactivo.']);
        }

        $user->status = false;
        $user->inactivated_by = auth()->id();
        $user->inactivated_at = now();
        $user->timestamps = false; // Esto evita que updated_at cambie
        $user->save();

        return redirect()->back()->with('success', 'Usuario inactivado correctamente.');
    }

    public function reactivate($id)
    {
        $user = \App\Models\User::findOrFail($id);

        if ($user->status) {
            return back()->withErrors(['status' => 'El usuario ya está activo.']);
        }

        $superAdminRole = \App\Models\Role::whereRaw('LOWER(name) = ?', ['superadministrador'])->first();
        if ($superAdminRole && $user->role_id == $superAdminRole->id) {
            $superAdminsCount = \App\Models\User::where('role_id', $superAdminRole->id)
                ->where('status', true)
                ->count();

            if ($superAdminsCount >= 2) {
                return back()->withErrors(['role_id' => 'Solo puede haber dos superadministradores activos.']);
            }
        }

        $user->timestamps = false; 
        $user->status = true;
        $user->save();

        return redirect()->back()->with('success', 'Usuario reactivado correctamente.');
    }


    public function index()
    {
        $users = \App\Models\User::where('status', true)->get();
        $inactives = \App\Models\User::where('status', false)->get();
        $roles_activos = \App\Models\Role::where('status', true)->get();
        $roles = \App\Models\Role::all();
        $document_types = \App\Models\DocumentType::where('status', true)->get();

        return \Inertia\Inertia::render('Usuarios', [
            'users' => $users,
            'inactives' => $inactives,
            'roles' => $roles,
            'document_types' => $document_types,
            'roles_activos' => $roles_activos,
            'document_types' => $document_types,
        ]);
    }
}
