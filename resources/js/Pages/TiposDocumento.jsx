import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


export default function TiposDocumento({ documenttypes, inactives }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showInactives, setShowInactives] = useState(false);
    const [search, setSearch] = useState('');
    const [viewing, setViewing] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);


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

    // Filtrar tipos de documento por búsqueda
    const documenttypesToShow = search.trim()
    ? documenttypes.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        String(doc.id).includes(search)
      )
    : documenttypes;

    const inactivesToShow = search.trim()
    ? inactives.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        String(doc.id).includes(search)
      )
    : inactives;

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
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border px-2 py-1 rounded w-72"
                    />
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
                            {documenttypesToShow.map(doc => (
                                <tr key={doc.id}>
                                    <td className="border px-4 py-2">{doc.id}</td>
                                    <td className="border px-4 py-2">{doc.name}</td>
                                    <td className="border px-4 py-2 flex gap-2">
                                        <button onClick={() => openEdit(doc)} className="text-indigo-700">Editar</button>
                                        <button onClick={() => inactivate(doc.id)} className="text-red-600">Inactivar</button>
                                        <button onClick={() => {setViewing(doc); setShowViewModal(true);}} className="text-blue-600">Detalles</button>
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
                            {inactivesToShow.map(doc => (
                                <tr key={doc.id}>
                                    <td className="border px-4 py-2">{doc.id}</td>
                                    <td className="border px-4 py-2">{doc.name}</td>
                                    <td className="border px-4 py-2 flex gap-2">
                                        <button onClick={() => reactivate(doc.id)} className="text-green-700">Reactivar</button>
                                        <button onClick={() => {setViewing(doc); setShowViewModal(true);}} className="text-blue-600">Detalles</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Modal para crear/editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 text-gray-400 hover:text-black"
                            >
                                X
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
        
                {/* Modal para ver detalles */}
                {showViewModal && viewing && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-black"
                        >
                            X
                        </button>
                        <h2 className="text-lg font-bold mb-4">Detalle del tipo de documento</h2>
                        <div className="mb-2"><b>ID:</b> {viewing.id}</div>
                        <div className="mb-2"><b>Nombre:</b> {viewing.name}</div>
                        <div className="mb-2"><b>Estado:</b> {viewing.status ? 'Activo' : 'Inactivo'}</div>
                        <div className="mb-2"><b>Creado por (ID):</b> {viewing.created_by}</div>
                        <div className="mb-2"><b>Fecha de creación:</b> {viewing.created_at ? dayjs(viewing.created_at).local().format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                        <div className="mb-2"><b>Modificado por (ID):</b> {viewing.updated_by}</div>
                        <div className="mb-2"><b>Fecha de modificación:</b> {viewing.updated_at ? dayjs(viewing.updated_at).local().format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                        <div className="mb-2"><b>Inactivado por (ID):</b> {viewing.inactivated_by}</div>
                        <div className="mb-2"><b>Fecha de inactivación:</b> {viewing.inactivated_at ? dayjs(viewing.inactivated_at).local().format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
