<?php

namespace App\Http\Controllers\Auth;

use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Crypt\RSA;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
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

        // Validar que no se pueda registrar como superadministrador
        $superAdminRole = \App\Models\Role::where('name', 'superadministrador')->first(); // Cambia 'name' por 'slug' si tu columna es diferente
        if ($superAdminRole && $request->role_id == $superAdminRole->id) {
            return back()->withErrors(['role_id' => 'No está permitido registrarse como superadministrador.'])->withInput();
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos', 'public');
        }

        // Cifrado RSA del password
        // Cargar la clave pública
        $publicKey = file_get_contents(storage_path('app/keys/public.pem'));
        $rsa = PublicKeyLoader::load($publicKey)->withPadding(RSA::ENCRYPTION_PKCS1);
        // Cifrar la contraseña que ingresa el usuario
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
            'password'           => $encryptedPassword, // Se guarda el password cifrado en la base de datos
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
