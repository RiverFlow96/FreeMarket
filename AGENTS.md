# AI Coding Agent Instructions for FreeMarket (Ecommerce)

This file provides essential guidance for AI coding agents working in this repository. It summarizes key conventions, build/test commands, and project structure to help agents be immediately productive. For details, refer to the [README.md](README.md).

## Project Overview

- **Backend:** Django 6+ (REST API)
- **Frontend:** React (Vite, TypeScript)

## Key Conventions

- All backend commands must be run from the `backend/` directory.
- Django apps are located in `backend/apps/` and use the `apps.<appname>` import path.
- The `name` in each `apps.py` must match the import path in `INSTALLED_APPS`.
- Use relative imports and configuration paths (not `backend.config`, just `config`).

## Build & Test Commands

- **Install dependencies:** `pip install -r backend/requirements.txt`
- **Run dev server:** `cd backend && python manage.py runserver`
- **Migrations:** `cd backend && python manage.py makemigrations && python manage.py migrate`
- **Create superuser:** `cd backend && python manage.py createsuperuser`
- **Check project:** `cd backend && python manage.py check`

## Troubleshooting

- If you see `ModuleNotFoundError: No module named 'apps'`, check:
  - `manage.py` is inside `backend/`
  - `INSTALLED_APPS` and `apps.py` names match
  - All config paths are relative

## Documentation

- See [README.md](README.md) for full setup, requirements, and troubleshooting steps.

---

This file should be updated as conventions or architecture evolve. For frontend or Docker-specific conventions, consider creating additional agent instruction files.
