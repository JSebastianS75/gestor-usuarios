# Gestor de Usuarios - SPA Laravel 12 + React/Inertia

Aplicación SPA para la gestión de usuarios, roles y tipos de documento.
Desarrollada con Laravel 12, Inertia.js y React.

## Requisitos

- PHP >= 8.1
- Composer
- Node.js >= 18
- PostgreSQL o MySQL

## Instalación

1. **Clona el repositorio**
git clone https://github.com/JSebastianS75/gestor-usuarios.git
cd gestor-usuarios

2. **Instala dependencias de backend y frontend**
composer install
npm install

3. **Copia y configura el archivo de entorno**
cp .env.example .env

- Edita .env y pon tus datos de base de datos y correo.
- Genera la clave de la app:  php artisan key:generate

4. **Crea el enlace simbólico para el storage**
php artisan storage:link

5. **Ejecuta migraciones y seeders**
php artisan migrate --seed

6. **(Importante) Llaves RSA**
Ninguna clave RSA (ni pública ni privada) se incluye en el repositorio.

Para que el sistema funcione correctamente, debe generar una nueva pareja de llaves RSA localmente con los siguientes comandos:

openssl genpkey -algorithm RSA -out storage/app/keys/private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in storage/app/keys/private.pem -out storage/app/keys/public.pem

7. **Inicia los servidores**
- Backend:  php artisan serve

- Frontend (Vite):  npm run dev

8. **Accede a la aplicación**
- Ingresa a [http://localhost:8000](http://localhost:8000)
- Usuario superadministrador inicial:
  - **login:** superadmin
  - **contraseña:** SuperAdmin123

## Notas

- Las fotos de usuario se guardan en `storage/app/public/photos` y se sirven por `/storage/photos/...`.
- Si subes el proyecto a otro servidor, repite `php artisan storage:link`.
- Los mensajes de validación están en español.
- El sistema cumple con todos los requisitos del microproyecto (SPA, roles, validaciones, cifrado RSA, etc).


¡Gracias por usar este proyecto! Para cualquier duda, contacta al desarrollador.