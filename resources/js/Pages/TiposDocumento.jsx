import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function TiposDocumento({ documenttypes, inactives }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showInactives, setShowInactives] = useState(false);

    // Formulario con useForm para crear/editar
    const { data, setData, post, put, reset, errors, clearErrors } = useForm({ name: '' });

    // Abrir modal para crear
    const openCreate = () => {
        reset();
        setEditing(null);
        setShowModal(true);
    };

    // Abrir modal para editar
    const openEdit = (doc) => {
        setData('name', doc.name);
        setEditing(doc);
        setShowModal(true);
    };

    // Cerrar modal y limpiar errores
    const closeModal = () => {
        clearErrors();
        reset();
        setShowModal(false);
    };

    // Guardar (crear o editar)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            put(route('tipos-documento.update', editing.id), {
                onSuccess: () => {
                    setShowModal(false);
                    router.reload({ only: ['documenttypes', 'inactives'] });
                },
                preserveScroll: true,
            });
        } else {
            post(route('tipos-documento.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    router.reload({ only: ['documenttypes', 'inactives'] });
                },
                preserveScroll: true,
            });
        }
    };

    // Inactivar
    const inactivate = (id) => {
        if (confirm('¿Seguro que deseas inactivar este tipo de documento?')) {
            router.delete(route('tipos-documento.destroy', id), {
                onSuccess: () => router.reload({ only: ['documenttypes', 'inactives'] }),
                preserveScroll: true,
            });
        }
    };

    // Reactivar
    const reactivate = (id) => {
        if (confirm('¿Reactivar este tipo de documento?')) {
            router.post(route('tipos-documento.reactivate', id), {}, {
                onSuccess: () => router.reload({ only: ['documenttypes', 'inactives'] }),
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tipos de Documento" />
            <div className="max-w-4xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Tipos de documento</h1>
                <div className="mb-4 flex gap-4">
                    <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Nuevo tipo de documento
                    </button>
                    <button onClick={() => setShowInactives(!showInactives)} className={"px-4 py-2 rounded " +
                        (showInactives
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-red-600 text-white hover:bg-red-700")
                        }
                    >
                        {showInactives ? 'Ver activos' : 'Ver inactivos'}
                    </button>
                </div>
                {/* Tabla de tipos de documento activos */}
                {!showInactives ? (
                    <table className="min-w-full bg-white shadow rounded">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documenttypes.map(doc => (
                                <tr key={doc.id}>
                                    <td className="border px-4 py-2">{doc.id}</td>
                                    <td className="border px-4 py-2">{doc.name}</td>
                                    <td className="border px-4 py-2 flex gap-2">
                                        <button onClick={() => openEdit(doc)} className="text-indigo-700">Editar</button>
                                        <button onClick={() => inactivate(doc.id)} className="text-red-600">Inactivar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    // Tabla de inactivos
                    <table className="min-w-full bg-white shadow rounded">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inactives.map(doc => (
                                <tr key={doc.id}>
                                    <td className="border px-4 py-2">{doc.id}</td>
                                    <td className="border px-4 py-2">{doc.name}</td>
                                    <td className="border px-4 py-2">
                                        <button onClick={() => reactivate(doc.id)} className="text-green-700">Reactivar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Modal para crear/editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded shadow-md w-96 relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 text-gray-400 hover:text-black"
                            >
                                ×
                            </button>
                            <h2 className="text-lg font-bold mb-4">{editing ? 'Editar tipo de documento' : 'Nuevo tipo de documento'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                </div>
                                <div className="flex justify-center gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Guardar
                                    </button>
                                    <button type="button" onClick={closeModal} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
