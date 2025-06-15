import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
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

    const submit = (e) => {
        e.preventDefault();

        // Uso FormData para enviar la foto
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        post(route('register'), {
            data: formData,
            forceFormData: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} encType="multipart/form-data">
                <div>
                    <InputLabel htmlFor="login" value="Login" />

                    <TextInput
                        id="login"
                        name="login"
                        value={data.login}
                        className="mt-1 block w-full"
                        maxlength={40}
                        onChange={(e) => setData('login', e.target.value)}
                        required
                    />

                    <InputError message={errors.login} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="first_name" value="Nombres" />

                    <TextInput
                        id="first_name"
                        name="first_name"
                        value={data.first_name}
                        className="mt-1 block w-full"
                        onChange={e => setData('first_name', e.target.value)}
                        required
                    />

                    <InputError message={errors.first_name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="last_name" value="Apellidos" />

                    <TextInput
                        id="last_name"
                        name="last_name"
                        value={data.last_name}
                        className="mt-1 block w-full"
                        onChange={e => setData('last_name', e.target.value)}
                        required
                    />

                    <InputError message={errors.last_name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="document_type_id" value="Tipo de documento" />

                    <select
                        id="document_type_id"
                        name="document_type_id"
                        value={data.document_type_id}
                        onChange={e => setData('document_type_id', e.target.value)}
                        required
                        className="mt-1 block w-full"
                    >
                        <option value="">Seleccione...</option>
                        <option value="1">Cédula de Ciudadanía</option>
                        <option value="2">Tarjeta de Identidad</option>
                        <option value="3">Cédula de Extranjería</option>
                        <option value="4">Pasaporte</option>
                    </select>

                    <InputError message={errors.document_type_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="document_number" value="Número de documento" />

                    <TextInput
                        id="document_number"
                        name="document_number"
                        value={data.document_number}
                        className="mt-1 block w-full"
                        onChange={e => setData('document_number', e.target.value)}
                        required
                    />

                    <InputError message={errors.document_number} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="gender" value="Género" />

                    <select
                        id="gender"
                        name="gender"
                        value={data.gender}
                        onChange={e => setData('gender', e.target.value)}
                        required
                        className="mt-1 block w-full"
                    >
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                    </select>

                    <InputError message={errors.gender} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="mobile_phone" value="Teléfono móvil" />

                    <TextInput
                        id="mobile_phone"
                        name="mobile_phone"
                        value={data.mobile_phone}
                        className="mt-1 block w-full"
                        onChange={e => setData('mobile_phone', e.target.value)}
                        required
                    />

                    <InputError message={errors.mobile_phone} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="role_id" value="Rol" />

                    <select
                        id="role_id"
                        name="role_id"
                        value={data.role_id}
                        onChange={e => setData('role_id', e.target.value)}
                        required
                        className="mt-1 block w-full"
                    >
                        <option value="">Seleccione...</option>
                        <option value="1">Administrador</option>
                        <option value="2">Usuario</option>
                    </select>

                    <InputError message={errors.role_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="birth_date" value="Fecha de nacimiento" />

                    <TextInput
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        value={data.birth_date}
                        className="mt-1 block w-full"
                        onChange={e => setData('birth_date', e.target.value)}
                        required
                    />

                    <InputError message={errors.birth_date} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="photo" value="Foto" />
                    <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={e => setData('photo', e.target.files[0])}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.photo} className="mt-2" />
                </div>

                 <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={e => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={e => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation || errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        ¿Ya tienes cuenta?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Registrarse
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
