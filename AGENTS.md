## Convenciones de búsqueda y productos

- La barra de búsqueda en la página de inicio redirige a `/products?q=...`.
- La página de productos (`/products`) consume la API REST de Django (`/api/v1/products/`) y muestra los productos según el término de búsqueda.
- El endpoint de productos es público (`AllowAny`) para permitir visualización sin autenticación.
- Los endpoints de creación/edición/eliminación requieren autenticación (`IsAuthenticated`).

## Filtros en página de productos

La página `/products` incluye filtros avanzados:

- **Búsqueda:** Por nombre de producto
- **Categoría:** Filtro por categoría (usa API `/api/v1/categories/`)
- **Precio:** Rango de precio con slider (0-5000 ARS)
- **Ordenamiento:** Por nombre (A-Z, Z-A) o precio (menor, mayor)
- Los filtros se aplican en tiempo real en el frontend

## Toast Notifications

El proyecto usa un sistema de Toast personalizado basado en shadcn/ui:

- **Archivos creados:**
  - `frontend/src/components/ui/use-toast.ts` - Hook para mostrar toasts
  - `frontend/src/components/ui/toast.tsx` - Componente Toast
  - `frontend/src/components/ui/toaster.tsx` - Contenedor de toasts
- **Uso en componentes:**

  ```typescript
  import { toast } from "@/components/ui/use-toast";

  toast({
    title: "Título",
    description: "Descripción",
    variant: "success" | "destructive" | "default",
  });
  ```

- **Variantes disponibles:** default, destructive, success
- El Toaster debe estar incluido en App.tsx: `<Toaster />`

## Información del vendedor

En los detalles del producto (`ProductDetail.tsx`) se muestra:

- Nombre del vendedor
- Email
- Teléfono (si el vendedor lo agregó)
- Dirección (si el vendedor la agregó)
- Botones para enviar mensaje o llamar

El modelo de usuario tiene campos:

- `phone`: Número de teléfono (opcional)
- `address`: Dirección (opcional)

## Archivos media

Las imágenes de productos se sirven desde `backend/media/`. En desarrollo, Django sirve estos archivos automáticamente.

## Registro de usuarios

El formulario de registro (`Register.tsx`) incluye:

- Usuario, email, contraseña (requeridos)
- Teléfono (opcional)
- Dirección (opcional)

## Notas de desarrollo

- Ejecutar `python manage.py migrate` para agregar el campo `address` a la base de datos
- El proxy de Vite reenvía `/api` a `localhost:8000`

## Planes de usuario y límites de productos

El modelo de usuario incluye un campo `plan` con tres opciones:

- **free**: Límite de 3 productos (valor por defecto)
- **plus**: Límite de 5 productos
- **pro**: Límite de 10 productos

### Endpoints relacionados

- `GET /api/v1/products/my_plan/` - Devuelve el plan actual, límite, cantidad de productos y si puede agregar más
- `POST /api/v1/users/update_plan/` - Actualiza el plan del usuario (requiere autenticación)

### Campos adicionales en serializadores de usuario

Los serializadores `UserSerializer` y `UserProfileSerializer` incluyen:

- `plan`: Plan actual del usuario
- `product_limit`: Límite de productos según el plan
- `product_count`: Cantidad de productos publicados
- `can_add_product`: Booleano que indica si puede agregar más productos

### Validación en creación de productos

Al intentar crear un producto, el backend valida si el usuario ha alcanzado su límite y devuelve un error 400 si corresponde.

# AI Coding Agent Instructions for FreeMarket (Ecommerce)

---

## Reglas permanentes para agentes y commits

- **Actualización obligatoria de AGENTS.md:**
  - Siempre que realices un cambio en el proyecto, actualiza este archivo para reflejar nuevas convenciones, reglas o prácticas.
  - Si agregas una nueva convención, documenta el cambio aquí antes de finalizar la tarea.
  - Si olvidas actualizar AGENTS.md, considera la tarea incompleta.
- **Commits en formato Conventional Commits:**
  - Todos los mensajes de commit deben seguir el estándar Conventional Commits (https://www.conventionalcommits.org/):
    - Estructura: &lt;tipo&gt;(&lt;área&gt;): &lt;descripción&gt;
    - Tipos válidos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
    - El área debe ser el módulo, carpeta o funcionalidad afectada (ej: frontend, backend, products, users, docker, etc).
    - La descripción debe ser breve y en imperativo.
    - Ejemplo: feat(frontend): mejora landing de búsqueda
    - Ejemplo: fix(backend): corrige error en serializador de productos
    - Ejemplo: docs(AGENTS): agrega regla de actualización de convenciones

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
