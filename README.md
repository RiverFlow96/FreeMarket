# Ecommerce Backend

Django REST API backend para el proyecto Ecommerce.

## Estructura del Proyecto

```
Ecommerce/
├── backend/                 # Proyecto Django
│   ├── apps/               # Aplicaciones Django
│   │   ├── users/          # Gestión de usuarios
│   │   ├── categories/    # Categorías de productos
│   │   └── products/      # Gestión de productos
│   ├── config/             # Configuración del proyecto
│   │   ├── settings.py    # Configuración principal
│   │   ├── urls.py       # URLs principales
│   │   ├── wsgi.py       # WSGI
│   │   └── asgi.py      # ASGI
│   ├── manage.py          # Utilidad CLI de Django
│   └── db.sqlite3        # Base de datos
├── frontend/              # Aplicación frontend (React)
├── .venv/               # Entorno virtual
└── README.md           # Este archivo
```

## Requisitos

- Python 3.12+
- Django 6.0+
- Django REST Framework
- django-cors-headers

## Instalación

1. Crear y activar el entorno virtual:
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# o
.venv\Scripts\activate   # Windows
```

2. Instalar dependencias:
```bash
pip install -r backend/requeriments.txt
```

## Uso

Todos los comandos deben ejecutarse desde la carpeta `backend/`:

### Servidor de desarrollo
```bash
cd backend
python manage.py runserver
```

### Crear migraciones
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Crear superusuario
```bash
cd backend
python manage.py createsuperuser
```

### Aplicar check
```bash
cd backend
python manage.py check
```

## Configuración de Apps

Las aplicaciones en `INSTALLED_APPS` usan rutas relativas desde `backend/`:

```python
INSTALLED_APPS = [
    'apps.users',
    'apps.categories',
    'apps.products',
]
```

El `name` en cada `apps.py` debe coincidir con la ruta:

```python
# apps/users/apps.py
name = 'apps.users'
```

## Corrección de Errores

### Error: ModuleNotFoundError: No module named 'apps'

Este error ocurría porque:
1. El archivo `manage.py` estaba fuera de la carpeta `backend/`
2. Las rutas en `INSTALLED_APPS` no coincidían con los `name` en `apps.py`
3. Referencias a `backend.config` en lugar de `config` en settings

### Solución aplicada

1. Mover `manage.py` dentro de `backend/`
2. Usar rutas relativas en `INSTALLED_APPS` (`apps.users` en lugar de `backend.apps.users`)
3. Actualizar `ROOT_URLCONF` y `WSGI_APPLICATION` a rutas relativas
4. Actualizar `DJANGO_SETTINGS_MODULE` en `wsgi.py` y `asgi.py`
5. Sincronizar el `name` en cada `apps.py` con la ruta en `INSTALLED_APPS`

## API Endpoints

- `/admin/` - Panel de administración Django
- `/api-auth/` - Login/logout para DRF