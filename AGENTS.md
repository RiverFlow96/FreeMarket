# FreeMarket - Ecommerce Project

## Essential Commands

```bash
# Frontend (always from frontend/ directory)
npm install && npm run lint && npm run build   # verify changes

# Backend (always from backend/ directory)
python manage.py check                         # verify Django config
python manage.py makemigrations && migrate    # after model changes
python manage.py runserver                     # dev server on :8000
```

## Project Structure

- **Backend**: Django REST API in `backend/` - apps in `backend/apps/`
- **Frontend**: React + Vite + TypeScript in `frontend/`
- **API prefix**: `/api/v1/`
- **Vite proxy**: `/api` → `localhost:8000`

## Critical Conventions

- Django imports use `apps.<appname>` path, not `backend.apps`
- `apps.py` names must match `INSTALLED_APPS` exactly
- Use relative config paths (e.g., `config`, not `backend.config`)
- Commit messages: `type(area): description` (Conventional Commits)
- Always update AGENTS.md when adding new conventions

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/v1/products/` | Any | List products (paginated) |
| `POST /api/v1/products/` | JWT | Create product |
| `GET /api/v1/products/{id}/` | Any | Product detail |
| `PUT/PATCH /api/v1/products/{id}/` | JWT | Update product |
| `DELETE /api/v1/products/{id}/` | JWT | Delete product |
| `GET /api/v1/products/me/products/` | JWT | User's products |
| `GET /api/v1/products/me/plan/` | JWT | User's plan info |
| `GET /api/v1/categories/` | Any | List categories |
| `GET /api/v1/users/me/` | JWT | Current user profile |
| `PUT /api/v1/users/me/` | JWT | Update profile |
| `POST /api/v1/users/me/password/` | JWT | Change password |
| `GET /api/v1/users/me/products/` | JWT | User's products |
| `POST /api/v1/users/update_plan/` | JWT | Update plan |
| `GET /api/v1/reports/` | JWT | List user's reports |
| `POST /api/v1/reports/` | JWT | Create report |
| `/api/v1/token/` | - | Obtain tokens |
| `/api/v1/token/refresh/` | - | Refresh token |

### Query Params (all paginated endpoints)

- `?page=1` - Page number (default: 1)
- `?page_size=20` - Items per page (max: 100)
- `?search=term` - Search filter (products only)
- `?category=name` - Filter by category
- `?min_price=X` / `?max_price=X` - Price range
- `?sort=price_asc|price_desc|name_asc|name_desc` - Sorting

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "pages": 5
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "errors": {...}
}
```

## Useful Patterns

```typescript
// Toast notifications
import { toast } from "@/components/ui/use-toast";
toast({ title: "Done", variant: "success" });

// Theme toggle
import { useThemeStore } from "@/store/themeStore";
const { toggleTheme } = useThemeStore();

// Scroll animations (extracted to external hooks)
import { ScrollFade, ScrollFadeIn } from "@/hooks/useScrollAnimation";

// Cached product fetching hook
import { useProducts } from "@/hooks/useProducts";
```

## Common Issues

- `ModuleNotFoundError: No module named 'apps'` → Check `INSTALLED_APPS` matches `apps.py` names
- Media files not loading → Ensure `MEDIA_URL` and `MEDIA_ROOT` are configured in Django
- CORS errors in development → Use `CORS_ALLOW_ALL_ORIGINS=true` in backend/.env

## Environment

- **Python venv**: `~/Programation/Projects/Ecommerce/.venv` (NOT in backend/)
- **Activate**: `source ~/Programation/Projects/Ecommerce/.venv/bin/activate`
- **Backend .env**: Located at `backend/.env` - must contain `CORS_ALLOW_ALL_ORIGINS=true` for local dev
- **Frontend .env**: Use `VITE_API_URL=http://localhost:8000/api/v1` for local, override for production

## Deployment

- **Backend**: Render.com - requires `CORS_ALLOW_ALL_ORIGINS=true` env var set in dashboard
- **Frontend**: Vercel - set `VITE_API_URL` to production backend URL in Vercel env vars

## CORS Notes

The frontend's `api.ts` defaults to localhost. For production, ensure:
1. Backend has `CORS_ALLOW_ALL_ORIGINS=true` (or specific origins in `CORS_ALLOWED_ORIGINS`)
2. Frontend's VITE_API_URL points to correct backend in production
