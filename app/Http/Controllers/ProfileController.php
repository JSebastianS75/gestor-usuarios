<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): \Inertia\Response
    {
        return \Inertia\Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
            'user' => $request->user()->load('role', 'documentType'),
            'roles' => \App\Models\Role::where('status', true)->get(['id', 'name']),
            'documentTypes' => \App\Models\DocumentType::where('status', true)->get(['id', 'name']),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $rules = [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'document_type_id' => 'required|exists:document_types,id',
            'document_number' => 'required|string|max:30',
            'gender' => 'required|in:M,F,O',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'mobile_phone' => 'required|string|max:20',
            'birth_date' => 'required|date|before:today',
            'photo' => 'nullable|image|max:2048',
            // NO incluyas 'role_id'
        ];

        $validated = $request->validate($rules);

        // Actualiza la foto si se envía
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('photos', 'public');
        } else {
            unset($validated['photo']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        $user = $request->user();

        // Descifrar la contraseña almacenada con la clave privada RSA
        $privateKey = file_get_contents(storage_path('app/keys/private.pem'));
        $rsa = \phpseclib3\Crypt\PublicKeyLoader::load($privateKey)
            ->withPadding(\phpseclib3\Crypt\RSA::ENCRYPTION_PKCS1);

        $decryptedPassword = $rsa->decrypt(base64_decode($user->password));

        // Comparar la contraseña ingresada con la descifrada
        if ($request->password !== $decryptedPassword) {
            return back()->withErrors(['password' => 'La contraseña actual no es correcta.']);
        }

        // Procede a eliminar la cuenta (o inactivar, según tu lógica)
        \Illuminate\Support\Facades\Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

}
