import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    user,
    roles,
    documentTypes,
    className = '',
}) {
    const auth = usePage().props.auth;
    const isSuperAdmin = auth.role === 'superadministrador';

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        document_type_id: user.document_type_id || '',
        document_number: user.document_number || '',
        gender: user.gender || '',
        email: user.email || '',
        mobile_phone: user.mobile_phone || '',
        birth_date: user.birth_date || '',
        role_id: user.role_id || '',
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Información de perfil
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Actualiza tu información personal.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">
                {/* Nombres */}
                <div>
                    <InputLabel htmlFor="first_name" value="Nombres" />
                    <TextInput
                        id="first_name"
                        className="mt-1 block w-full"
                        value={data.first_name}
                        onChange={e => setData('first_name', e.target.value)}
                        required
                        autoComplete="given-name"
                    />
                    <InputError className="mt-2" message={errors.first_name} />
                </div>
                {/* Apellidos */}
                <div>
                    <InputLabel htmlFor="last_name" value="Apellidos" />
                    <TextInput
                        id="last_name"
                        className="mt-1 block w-full"
                        value={data.last_name}
                        onChange={e => setData('last_name', e.target.value)}
                        required
                        autoComplete="family-name"
                    />
                    <InputError className="mt-2" message={errors.last_name} />
                </div>
                {/* Tipo de documento */}
                <div>
                    <InputLabel htmlFor="document_type_id" value="Tipo de documento" />
                    <select
                        id="document_type_id"
                        className="mt-1 block w-full border px-2 py-1 rounded"
                        value={data.document_type_id}
                        onChange={e => setData('document_type_id', e.target.value)}
                        required
                    >
                        <option value="">Seleccione...</option>
                        {documentTypes.map(dt => (
                            <option key={dt.id} value={dt.id}>{dt.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.document_type_id} />
                </div>
                {/* Número de documento */}
                <div>
                    <InputLabel htmlFor="document_number" value="Número de documento" />
                    <TextInput
                        id="document_number"
                        className="mt-1 block w-full"
                        value={data.document_number}
                        onChange={e => setData('document_number', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.document_number} />
                </div>
                {/* Género */}
                <div>
                    <InputLabel htmlFor="gender" value="Género" />
                    <select
                        id="gender"
                        className="mt-1 block w-full border px-2 py-1 rounded"
                        value={data.gender}
                        onChange={e => setData('gender', e.target.value)}
                        required
                    >
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                    </select>
                    <InputError className="mt-2" message={errors.gender} />
                </div>
                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>
                {/* Teléfono móvil */}
                <div>
                    <InputLabel htmlFor="mobile_phone" value="Teléfono móvil" />
                    <TextInput
                        id="mobile_phone"
                        className="mt-1 block w-full"
                        value={data.mobile_phone}
                        onChange={e => setData('mobile_phone', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.mobile_phone} />
                </div>
                {/* Fecha de nacimiento */}
                <div>
                    <InputLabel htmlFor="birth_date" value="Fecha de nacimiento" />
                    <TextInput
                        id="birth_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={data.birth_date}
                        onChange={e => setData('birth_date', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.birth_date} />
                </div>
                {/* Rol */}
                <div>
                    <InputLabel htmlFor="role" value="Rol" />
                    <span className="mt-1 block w-full px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {roles.find(r => r.id === user.role_id)?.name || 'Sin rol'}
                    </span>
                </div>
                {/* Foto */}
                <div>
                    <InputLabel htmlFor="photo" value="Foto" />
                    <input
                        id="photo"
                        type="file"
                        className="mt-1 block w-full"
                        onChange={e => setData('photo', e.target.files[0])}
                        accept="image/*"
                    />
                    <InputError className="mt-2" message={errors.photo} />
                </div>
                {/* Botón */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                    {recentlySuccessful && (
                        <p className="text-sm text-gray-600">Guardado.</p>
                    )}
                </div>
            </form>
        </section>
    );
}
