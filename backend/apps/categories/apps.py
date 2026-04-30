from django.apps import AppConfig


DEFAULT_CATEGORIES = [
    "Electronica",
    "Ropa y Accesorios",
    "Hogar y Muebles",
    "Deportes",
    "Libros",
    "Juguetes",
    "Salud y Belleza",
    "Alimentos y Bebidas",
    "Vehiculos",
    "Servicios",
]


class CategoriesConfig(AppConfig):
    name = "apps.categories"

    def ready(self):
        from apps.categories.models import Category

        for name in DEFAULT_CATEGORIES:
            Category.objects.get_or_create(name=name)
