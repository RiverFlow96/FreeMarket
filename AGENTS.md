
# AI Coding Agent Instructions for FreeMarket (Ecommerce)

This file provides essential guidance for AI coding agents working in this repository. It summarizes conventions, build/test commands, and project structure to help agents be immediately productive. For more details, see the [README.md](README.md).

---

## Project Overview

- **Backend:** Django 6+ (REST API)
- **Frontend:** React (Vite, TypeScript)

## Key Conventions

- All backend commands must be run from the `backend/` directory.
- Django apps are in `backend/apps/` and use the `apps.<appname>` import path.
- The `name` in each `apps.py` must match the import path in `INSTALLED_APPS`.
- Use relative imports and configuration paths (not `backend.config`, just `config`).
- For frontend, use Vite scripts from the `frontend/` directory.

## Build & Test Commands

### Backend (Django)

- **Instalar dependencias:** `pip install -r backend/requirements.txt` o `pip install -r backend/requeriments.txt`
- **Servidor de desarrollo:** `cd backend && python manage.py runserver`
- **Migraciones:** `cd backend && python manage.py makemigrations && python manage.py migrate`
- **Crear superusuario:** `cd backend && python manage.py createsuperuser`
- **Check project:** `cd backend && python manage.py check`

### Frontend (React + Vite)

- **Instalar dependencias:** `cd frontend && npm install` (o `bun i` si usas Bun)
- **Desarrollo:** `cd frontend && npm run dev`
- **Build:** `cd frontend && npm run build`
- **Lint:** `cd frontend && npm run lint`

## Docker

- Usa el `Dockerfile` para producción y `Dockerfile.dev` para desarrollo local.
- Comandos útiles:
  - Build: `docker build -t mi-ecommerce-api .`
  - Run: `docker run -d -p 8000:8000 --name ecommerce_container mi-ecommerce-api`

## Estructura del Proyecto

Ver [README.md](README.md) para un diagrama y detalles de la estructura.

## Troubleshooting

- Si ves `ModuleNotFoundError: No module named 'apps'`, revisa:
  - Que `manage.py` esté dentro de `backend/`
  - Que los nombres en `INSTALLED_APPS` y `apps.py` coincidan
  - Que todas las rutas de configuración sean relativas

## API Endpoints

- `/admin/` - Panel de administración Django
- `/api/v1/` - Endpoints principales (users, products, categories)
- `/api/v1/doc/` - Documentación Swagger generada automáticamente
- `/api/v1/token/` y `/api/v1/token/refresh/` - Autenticación JWT

## Mejores Prácticas y Mejoras Pendientes

- Mejorar el modelo de usuario usando `AbstractUser` o `AbstractBaseUser` para mayor flexibilidad y seguridad.
- Fortalecer permisos para que solo el dueño pueda modificar/eliminar sus productos.
- Agregar validaciones personalizadas en los serializadores.
- Implementar mensajería interna, sistema de reportes y favoritos.
- Mantener la documentación de la API actualizada.
- Ver más en [TODO.md](TODO.md).

---

Actualiza este archivo si cambian las convenciones o la arquitectura. Para convenciones específicas de frontend o Docker, considera crear archivos de instrucciones adicionales.
