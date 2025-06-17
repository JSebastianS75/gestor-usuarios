import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function Usuarios({ users, inactives,roles, roles_activos, document_types}) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showInactives, setShowInactives] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewing, setViewing] = useState(null);
    const [search, setSearch] = useState('');

    // Formulario para crear/editar usuario
    const { data, setData, post, put, reset, errors, clearErrors } = useForm({
        login: '',
        first_name: '',
        last_name: '',
        document_type_id: '',
        document_number: '',
        gender: '',
        email: '',
        mobile_phone: '',
        role_id: '',
        birth_date: '',
        photo: null,
        password: '',
        password_confirmation: '',
    });

    // Filtrado de usuarios activos/inactivos
    const usersToShow = search.trim()
        ? users.filter(u =>
            u.login.toLowerCase().includes(search.toLowerCase()) ||
            u.first_name.toLowerCase().includes(search.toLowerCase()) ||
            u.last_name.toLowerCase().includes(search.toLowerCase()) ||
            String(u.id).includes(search)
        )
        : users;

    const inactivesToShow = search.trim()
        ? inactives.filter(u =>
            u.login.toLowerCase().includes(search.toLowerCase()) ||
            u.first_name.toLowerCase().includes(search.toLowerCase()) ||
            u.last_name.toLowerCase().includes(search.toLowerCase()) ||
            String(u.id).includes(search)
        )
        : inactives;

    // Funciones para abrir/cerrar modales
    const openCreate = () => { reset(); clearErrors(); setEditing(null); setShowModal(true); };
    const openEdit = (user) => {
        setEditing(user);
        setData({
            login: user.login,
            first_name: user.first_name,
            last_name: user.last_name,
            document_type_id: user.document_type_id,
            document_number: user.document_number,
            gender: user.gender,
            email: user.email,
            mobile_phone: user.mobile_phone,
            role_id: user.role_id,
            birth_date: user.birth_date,
            photo: null,
            password: '',
            password_confirmation: '',
        });
        clearErrors();
        setShowModal(true);
    };
    const openView = (user) => { setViewing(user); setShowViewModal(true); };
    const closeModal = () => { clearErrors(); reset(); setShowModal(false); };
    const closeViewModal = () => { setViewing(null); setShowViewModal(false); };

    // Guardar usuario (crear o editar)
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (editing) {
            formData.append('_method', 'PUT');
            router.post(route('usuarios.update', editing.id), formData, {
                forceFormData: true,
                onSuccess: () => { closeModal(); router.reload({ only: ['users', 'inactives'] }); },
                preserveScroll: true,
            });
        } else {
            router.post(route('usuarios.store'), formData, {
                forceFormData: true,
                onSuccess: () => { closeModal(); router.reload({ only: ['users', 'inactives'] }); },
                preserveScroll: true,
            });
        }
    };

    // Inactivar y reactivar
    const inactivate = (id) => {
        if (confirm('¿Seguro que deseas inactivar este usuario?')) {
            router.delete(route('usuarios.destroy', id), {
                onSuccess: () => router.reload({ only: ['users', 'inactives'] }),
                preserveScroll: true,
            });
        }
    };
    const reactivate = (id) => {
        if (confirm('¿Reactivar este usuario?')) {
            router.post(route('usuarios.reactivate', id), {}, {
                onSuccess: () => router.reload({ only: ['users', 'inactives'] }),
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Usuarios" />
            <div className="max-w-6xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
                <div className="mb-4 flex gap-4">
                    <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nuevo usuario</button>
                    <button onClick={() => setShowInactives(!showInactives)} className={"px-4 py-2 rounded " + (showInactives ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700")}>{showInactives ? 'Ver activos' : 'Ver inactivos'}</button>
                    <input type="text" placeholder="Buscar por login, nombre o ID" value={search} onChange={e => setSearch(e.target.value)} className="border px-2 py-1 rounded w-72" />
                </div>
                {/* Tabla de usuarios activos/inactivos */}
                {!showInactives ? (
                    <table className="min-w-full bg-white shadow rounded">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Login</th>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersToShow.map(user => (
                                <tr key={user.id}>
                                    <td className="border px-4 py-2">{user.id}</td>
                                    <td className="border px-4 py-2">{user.login}</td>
                                    <td className="border px-4 py-2">{user.first_name} {user.last_name}</td>
                                    <td className="border px-4 py-2">{roles.find(r => r.id === user.role_id)?.name || user.role_id}</td>
                                    <td className="border px-4 py-2 flex gap-2">
                                        <button onClick={() => openEdit(user)} className="text-indigo-700">Editar</button>
                                        <button onClick={() => inactivate(user.id)} className="text-red-600">Inactivar</button>
                                        <button onClick={() => openView(user)} className="text-blue-600">Detalles</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full bg-white shadow rounded">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Login</th>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inactivesToShow.map(user => (
                                <tr key={user.id}>
                                    <td className="border px-4 py-2">{user.id}</td>
                                    <td className="border px-4 py-2">{user.login}</td>
                                    <td className="border px-4 py-2">{user.first_name} {user.last_name}</td>
                                    <td className="border px-4 py-2">{roles.find(r => r.id === user.role_id)?.name || user.role_id}</td>
                                    <td className="border px-4 py-2 flex gap-2">
                                        <button onClick={() => reactivate(user.id)} className="text-green-700">Reactivar</button>
                                        <button onClick={() => openView(user)} className="text-blue-600">Detalles</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Modal para crear/editar usuario */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-black">X</button>
                            <h2 className="text-lg font-bold mb-4">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h2>
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="mb-4">
                                    <label className="block mb-1">Login</label>
                                    <input type="text" value={data.login} onChange={e => setData('login', e.target.value)} className="w-full border px-2 py-1 rounded" maxLength={40} required />
                                    {errors.login && <div className="text-red-500 text-sm">{errors.login}</div>}
                                </div>
                                <div className="mb-4 flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block mb-1">Nombres</label>
                                        <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                        {errors.first_name && <div className="text-red-500 text-sm">{errors.first_name}</div>}
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-1">Apellidos</label>
                                        <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                        {errors.last_name && <div className="text-red-500 text-sm">{errors.last_name}</div>}
                                    </div>
                                </div>
                                <div className="mb-4 flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block mb-1">Tipo de documento</label>
                                        <select value={data.document_type_id} onChange={e => setData('document_type_id', e.target.value)} className="w-full border px-2 py-1 rounded" required>
                                            <option value="">Seleccione...</option>
                                            {document_types.map(dt => (
                                                <option key={dt.id} value={dt.id}>{dt.name}</option>
                                            ))}
                                        </select>
                                        {errors.document_type_id && <div className="text-red-500 text-sm">{errors.document_type_id}</div>}
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-1">Número de documento</label>
                                        <input type="text" value={data.document_number} onChange={e => setData('document_number', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                        {errors.document_number && <div className="text-red-500 text-sm">{errors.document_number}</div>}
                                    </div>
                                </div>
                                <div className="mb-4 flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block mb-1">Género</label>
                                        <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="w-full border px-2 py-1 rounded" required>
                                            <option value="">Seleccione...</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                        {errors.gender && <div className="text-red-500 text-sm">{errors.gender}</div>}
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-1">Rol</label>
                                        <select value={data.role_id} onChange={e => setData('role_id', e.target.value)} className="w-full border px-2 py-1 rounded" required>
                                            <option value="">Seleccione...</option>
                                            {roles_activos.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        {errors.role_id && <div className="text-red-500 text-sm">{errors.role_id}</div>}
                                    </div>
                                </div>
                                <div className="mb-4 flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block mb-1">Correo electrónico</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                        {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-1">Teléfono móvil</label>
                                        <input type="text" value={data.mobile_phone} onChange={e => setData('mobile_phone', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                        {errors.mobile_phone && <div className="text-red-500 text-sm">{errors.mobile_phone}</div>}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Fecha de nacimiento</label>
                                    <input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                    {errors.birth_date && <div className="text-red-500 text-sm">{errors.birth_date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1">Foto (opcional)</label>
                                    <input type="file" accept="image/*" onChange={e => setData('photo', e.target.files[0])} className="w-full border px-2 py-1 rounded" />
                                    {errors.photo && <div className="text-red-500 text-sm">{errors.photo}</div>}
                                </div>
                                {!editing && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block mb-1">Contraseña</label>
                                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block mb-1">Confirmar contraseña</label>
                                            <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full border px-2 py-1 rounded" required />
                                            {errors.password_confirmation && <div className="text-red-500 text-sm">{errors.password_confirmation}</div>}
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-center gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
                                    <button type="button" onClick={closeModal} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de detalles */}
                {showViewModal && viewing && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                            <button onClick={closeViewModal} className="absolute top-2 right-2 text-gray-400 hover:text-black">X</button>
                            <h2 className="text-lg font-bold mb-4">Detalle del usuario</h2>
                            <div className="mb-2"><b>ID:</b> {viewing.id}</div>
                            <div className="mb-2"><b>Login:</b> {viewing.login}</div>
                            <div className="mb-2"><b>Nombre:</b> {viewing.first_name} {viewing.last_name}</div>
                            <div className="mb-2"><b>Rol:</b> {roles.find(r => r.id === viewing.role_id)?.name || viewing.role_id}</div>
                            <div className="mb-2"><b>Tipo de documento:</b> {document_types.find(dt => dt.id === viewing.document_type_id)?.name || viewing.document_type_id}</div>
                            <div className="mb-2"><b>Número de documento:</b> {viewing.document_number}</div>
                            <div className="mb-2"><b>Género:</b> {viewing.gender}</div>
                            <div className="mb-2"><b>Email:</b> {viewing.email}</div>
                            <div className="mb-2"><b>Teléfono:</b> {viewing.mobile_phone}</div>
                            <div className="mb-2"><b>Fecha de nacimiento:</b> {viewing.birth_date}</div>
                            <div className="mb-2"><b>Estado:</b> {viewing.status ? 'Activo' : 'Inactivo'}</div>
                            <div className="mb-2"><b>Creado por (ID):</b> {viewing.created_by}</div>
                            <div className="mb-2"><b>Fecha de creación:</b> {viewing.created_at ? dayjs(viewing.created_at).local().format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                            <div className="mb-2"><b>Modificado por (ID):</b> {viewing.updated_by}</div>
                            <div className="mb-2"><b>Fecha de modificación:</b> {viewing.updated_at ? dayjs(viewing.updated_at).local().format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                            <div className="mb-2"><b>Inactivado por (ID):</b> {viewing.inactivated_by}</div>
                            <div className="mb-2"><b>Fecha de inactivación:</b> {viewing.inactivated_at ? dayjs(viewing.inactivated_at).local().format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                            {viewing.photo && (
                                <div className="mb-2">
                                    <b>Foto:</b><br />
                                    <img src={`/storage/${viewing.photo}`} alt="Foto" className="h-24 w-24 object-cover rounded-full" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
