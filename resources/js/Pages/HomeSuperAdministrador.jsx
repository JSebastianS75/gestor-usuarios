import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function HomeSuperAdministrador() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [open, setOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Inicio Superadministrador" />
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-10">
                    Bienvenido, {user.first_name} {user.last_name}
                </h1>
                <nav className="flex space-x-4">
                    {/* Menú principal: Sistema */}
                    <div
                        className="relative"
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                    >
                        <button
                            className="px-6 py-2 bg-blue-700 text-white rounded-t hover:bg-blue-800 focus:outline-none"
                        >
                            Sistema
                        </button>
                        {open && (
                            <div className="absolute left-0 top-full bg-blue-600 text-white shadow-lg rounded-b w-56 z-10">
                                <Link href={route('usuarios.index')} className="block px-6 py-2 hover:bg-blue-800">Usuarios</Link>
                                <Link href={route('tipos-documento.index')} className="block px-6 py-2 hover:bg-blue-800">Tipos de documento</Link>
                                <Link href={route('roles.index')} className="block px-6 py-2 hover:bg-blue-800">Roles</Link>
                            </div>
                        )}
                    </div>
                    {/* Solo Reportes con tooltip */}
                    <div>
                        <button
                            data-tooltip-id="reportes-tooltip"
                            data-tooltip-content="Próximamente"
                            data-tooltip-place="bottom"
                            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                            disabled
                            style={{ cursor: 'not-allowed', opacity: 0.7 }}
                        >
                            Reportes
                        </button>
                        <Tooltip id="reportes-tooltip" />
                    </div>
                </nav>
            </div>
        </AuthenticatedLayout>
    );
}
