<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Crypt\RSA;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        // Cifrado RSA del password
        $publicKey = file_get_contents(storage_path('app/keys/public.pem'));
        $rsa = PublicKeyLoader::load($publicKey)->withPadding(RSA::ENCRYPTION_PKCS1);
        $encryptedPassword = base64_encode($rsa->encrypt($validated['password']));

        $request->user()->update([
            'password' => $encryptedPassword,
        ]);

        return back()->with('success', 'Contraseña actualizada correctamente.');
    }
}
