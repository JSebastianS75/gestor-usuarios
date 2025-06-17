import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';


export default function HomeUsuario() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <AuthenticatedLayout>
            <Head title="Inicio Usuario" />
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-6">
                    Bienvenido Usuario, {user.first_name} {user.last_name}
                </h1>
            </div>
        </AuthenticatedLayout>
    );
}
