<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\DocumentType;
use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Crypt\RSA;

class SuperAdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Se obtiene el rol superadministrador y el primer tipo de documento
        $role = Role::where('name', 'superadministrador')->first();
        $documentType = DocumentType::first();

        // Se cifra el password con la clave pública RSA
        $publicKey = file_get_contents(storage_path('app/keys/public.pem'));
        $rsa = PublicKeyLoader::load($publicKey)->withPadding(RSA::ENCRYPTION_PKCS1);
        $encryptedPassword = base64_encode($rsa->encrypt('SuperAdmin123'));

        // Se crea el usuario solo si no existe
        User::firstOrCreate(
            ['login' => 'superadmin'],
            [
                'first_name' => 'Super',
                'last_name' => 'Administrador',
                'document_type_id' => $documentType->id,
                'document_number' => '1000000000',
                'gender' => 'O',
                'email' => 'superadmin@demo.com',
                'mobile_phone' => '3000000000',
                'role_id' => $role->id,
                'birth_date' => '1990-01-01',
                'password' => $encryptedPassword,
                'status' => true,
                'created_by' => 1,
            ]
        );
    }
}

