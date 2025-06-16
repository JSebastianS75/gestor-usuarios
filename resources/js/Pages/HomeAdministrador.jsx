import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';


export default function HomeAdministrador() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <AuthenticatedLayout>
            <Head title="Inicio Administrador" />
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-6">
                    Bienvenido Administrador, {user.first_name} {user.last_name}
                </h1>
                <nav className="bg-white shadow rounded-lg p-4 flex gap-8">
                    <Link href={route('usuarios.index')} className="font-semibold hover:underline">Usuarios</Link>
                    <Link href={route('tipos-documento.index')} className="font-semibold hover:underline">Tipos de documento</Link>
                    <Link href={route('roles.index')} className="font-semibold hover:underline">Roles</Link>
                </nav>
            </div>
        </AuthenticatedLayout>
    );
}
