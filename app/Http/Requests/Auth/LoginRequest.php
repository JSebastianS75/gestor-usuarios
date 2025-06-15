<?php

namespace App\Http\Requests\Auth;

use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Crypt\RSA;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:40'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Normalizar el login a minúsculas
        $login = strtolower($this->input('login'));
        $password = $this->input('password');

        // Buscar el usuario por login
        $user = User::where('login', $login)->first();
        
        if (!$user) {
            $this->throwLoginError();
        }

        // Descifrar el password almacenado usando la clave privada
        $privateKey = file_get_contents(storage_path('app/keys/private.pem'));
        $rsa = PublicKeyLoader::load($privateKey)->withPadding(RSA::ENCRYPTION_PKCS1);

        try {
            $decryptedPassword = $rsa->decrypt(base64_decode($user->password));
        } catch (\Exception $e) {
            $this->throwLoginError();
        }

        // Comparar el password descifrado con el ingresado
        if ($decryptedPassword !== $password) {
            $this->throwLoginError();
        }

        // Si todo está bien, autentica al usuario manualmente
        Auth::login($user, $this->boolean('remember'));

        RateLimiter::clear($this->throttleKey());
    }

    /**
    * Lanza el error de login y cuenta el intento fallido.
    */
    private function throwLoginError()
    {
        RateLimiter::hit($this->throttleKey());
        throw ValidationException::withMessages([
            'login' => trans('auth.failed'),
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('login')).'|'.$this->ip());
    }
}
