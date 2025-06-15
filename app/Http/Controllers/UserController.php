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
        $superAdminRole = \App\Models\Role::where('name', 'superadministrador')->first();
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

        return response()->json(['success' => true]);
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

        $superAdminRole = \App\Models\Role::where('name', 'superadministrador')->first();
        if ($superAdminRole && $request->role_id == $superAdminRole->id) {
            // Contar superadmins activos, excluyendo el usuario que se está editando
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
            $rsa = PublicKeyLoader::load($publicKey)->withPadding(RSA::ENCRYPTION_PKCS1);
            $encryptedPassword = base64_encode($rsa->encrypt($request->password));
            $user->password = $encryptedPassword;
        }

        // Actualizar otros campos
        $user->first_name         = $request->first_name;
        $user->last_name          = $request->last_name;
        $user->document_type_id   = $request->document_type_id;
        $user->document_number    = $request->document_number;
        $user->gender             = $request->gender;
        $user->email              = $request->email;
        $user->mobile_phone       = $request->mobile_phone;
        $user->role_id            = $request->role_id;
        $user->birth_date         = $request->birth_date;

        $user->updated_by = auth()->id();
        $user->save();

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function inactivate($id)
    {
        $user = \App\Models\User::findOrFail($id);

        // Solo se puede inactivar si el usuario está activo
        if (!$user->status) {
            return back()->withErrors(['status' => 'El usuario ya está inactivo.']);
        }

        $user->status = false;
        $user->inactivated_by = auth()->id();
        $user->save();

        return response()->json(['success' => true]);
    }

    public function reactivate($id)
    {
        $user = \App\Models\User::findOrFail($id);

        if ($user->status) {
            return back()->withErrors(['status' => 'El usuario ya está activo.']);
        }

        $superAdminRole = \App\Models\Role::where('name', 'superadministrador')->first();
        if ($superAdminRole && $user->role_id == $superAdminRole->id) {
            $superAdminsCount = \App\Models\User::where('role_id', $superAdminRole->id)
                ->where('status', true)
                ->count();

            if ($superAdminsCount >= 2) {
                return back()->withErrors(['role_id' => 'Solo puede haber dos superadministradores activos.']);
            }
        }

        $user->status = true;
        $user->reactivated_by = auth()->id();
        $user->save();

        return response()->json(['success' => true]);
    }


    public function index()
    {
        // Listar solo usuarios activos
        $users = \App\Models\User::where('status', true)->get();
        return response()->json(['users' => $users]);
    }

    public function inactives()
    {
        // Listar solo usuarios inactivos
        $users = \App\Models\User::where('status', false)->get();
        return response()->json(['users' => $users]);
    }
}
