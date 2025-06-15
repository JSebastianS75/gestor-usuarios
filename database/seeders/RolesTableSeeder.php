<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(
            ['name' => 'superadministrador'],
            ['status' => true, 'created_by' => 1]
        );
        Role::firstOrCreate(
            ['name' => 'Administrador'],
            ['status' => true, 'created_by' => 1]
        );
        Role::firstOrCreate(
            ['name' => 'Usuario'],
            ['status' => true, 'created_by' => 1]
        );
    }
}
