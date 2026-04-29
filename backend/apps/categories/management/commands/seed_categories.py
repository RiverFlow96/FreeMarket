from django.core.management.base import BaseCommand
from apps.categories.models import Category

CATEGORIES = [
    "Electrónica",
    "Vehículos",
    "Inmuebles",
    "Muebles",
    "Ropa y Accesorios",
    "Deportes",
    "Libros y Música",
    "Hogar y Jardín",
    "Salud y Belleza",
    "Juguetes",
    "Electrodomésticos",
    "Animales",
    "Servicios",
    "Otros",
]


class Command(BaseCommand):
    help = "Crea categorías por defecto."

    def handle(self, *args, **kwargs):
        for cat_name in CATEGORIES:
            category, created = Category.objects.get_or_create(name=cat_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Categoría creada: {category.name}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Categoría ya existe: {category.name}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Total categorías: {Category.objects.count()}")
        )
