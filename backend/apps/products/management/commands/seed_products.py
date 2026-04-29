from django.core.management.base import BaseCommand
from apps.products.models import Product
from apps.categories.models import Category
from django.contrib.auth import get_user_model

PRODUCTS = [
    {
        "name": "iPhone 14 Pro",
        "description": "Apple iPhone 14 Pro 128GB, color negro, nuevo en caja.",
        "price": 1200.00,
        "image": "https://picsum.photos/seed/iphone14pro/512/512",
    },
    {
        "name": "Samsung Galaxy S23",
        "description": "Samsung Galaxy S23 Ultra, 256GB, excelente estado.",
        "price": 950.00,
        "image": "https://picsum.photos/seed/samsunggalaxy/512/512",
    },
    {
        "name": "Laptop Dell XPS 13",
        "description": "Dell XPS 13, Intel i7, 16GB RAM, 512GB SSD, como nueva.",
        "price": 1400.00,
        "image": "https://picsum.photos/seed/dellxps13/512/512",
    },
    {
        "name": "Bicicleta Trek FX 3",
        "description": "Bicicleta híbrida Trek FX 3 Disc, talla M, poco uso.",
        "price": 600.00,
        "image": "https://picsum.photos/seed/trekbicycle/512/512",
    },
    {
        "name": "PlayStation 5",
        "description": "Sony PlayStation 5, 1TB, con dos controles y 3 juegos.",
        "price": 700.00,
        "image": "https://picsum.photos/seed/ps5console/512/512",
    },
]


class Command(BaseCommand):
    help = "Crea productos de ejemplo para pruebas."

    def handle(self, *args, **kwargs):
        User = get_user_model()
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR("No hay usuarios en la base de datos."))
            return
        category, _ = Category.objects.get_or_create(name="Electrónica")
        for prod in PRODUCTS:
            obj, created = Product.objects.get_or_create(
                name=prod["name"],
                defaults={
                    "description": prod["description"],
                    "price": prod["price"],
                    "category": category,
                    "seller": user,
                    "image": prod["image"],
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Producto creado: {obj.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Producto ya existe: {obj.name}"))
