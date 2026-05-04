# FreeMarket - Ecommerce Project

## Commands (verify changes)

```bash
# Frontend (always from frontend/ directory)
npm install && npm run lint && npm run build

# Backend (activate venv at PROJECT ROOT, NOT in backend/)
source ~/Programation/Projects/Ecommerce/.venv/bin/activate
python manage.py check
python manage.py makemigrations && migrate
python manage.py runserver
```

## Critical Conventions

- **Django apps**: Use `apps.<name>` path, NOT `backend.apps`
- **apps.py**: `name` must match `INSTALLED_APPS` exactly
- **Config paths**: Use relative paths (e.g., `config`, not `backend.config`)
- **Commit format**: `type(area): description` (Conventional Commits)

## Tech Stack

- **Backend**: Django 6.0 + DRF + JWT (djangorestframework-simplejwt)
- **Frontend**: React 19 + Vite + TypeScript + Tailwind 4
- **Path alias**: `@` → `./src` (defined in vite.config.ts)
- **Vite proxy**: `/api` and `/media` → `localhost:8000`
- **Apps**: users, categories, products, reports, utils

## Environment

| Variable | Location | Required |
|----------|----------|----------|
| `CORS_ALLOW_ALL_ORIGINS=true` | `backend/.env` | Local dev |
| `VITE_API_URL` | Frontend env | Production |

## API Response Format

```json
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "page_size": 20, "pages": 5 } }
```
Error: `{ "success": false, "error": "message", "errors": {...} }`

## Common Issues

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'apps'` | Check `INSTALLED_APPS` matches `apps.py` names |
| CORS errors | Add `CORS_ALLOW_ALL_ORIGINS=true` to backend/.env |

## Pre-commit

- First run downloads environments (slow)
- Frontend lint: `npm run lint --prefix frontend` (always use --prefix from project root)
- If hangs: `rm ~/.cache/pre-commit/.lock`

## Testing

```bash
# Backend tests
python manage.py test
```

## SEO Deploy Checklist

Update with real domain before production:
- `frontend/public/robots.txt` (sitemap URL)
- `frontend/public/sitemap.xml` (all `<loc>` URLs)
- `frontend/index.html` (canonical, og:url, og:image, schema)

## Dev Ports

- Frontend: `http://localhost:5173` (or 5174 if busy)
- Backend: `http://localhost:8000`

## See Also

- `TODO.md` - Project roadmap and future features