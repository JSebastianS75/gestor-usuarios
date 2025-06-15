<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DocumentType::firstOrCreate(
            ['name' => 'Cédula de Ciudadanía'], 
            ['status' => true]
        );
        DocumentType::firstOrCreate(
            ['name' => 'Tarjeta de Identidad'], 
            ['status' => true]
        );
        DocumentType::firstOrCreate(
            ['name' => 'Cédula de Extranjería'], 
            ['status' => true]
        );
        DocumentType::firstOrCreate(
            ['name' => 'Pasaporte'], 
            ['status' => true]
        );
    }
}
