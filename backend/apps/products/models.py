import os
from django.db import models
from apps.categories.models import Category


def product_image_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()

    if hasattr(instance, "seller"):
        username = instance.seller.username if instance.seller else "user"
        product_name = (instance.name or "product").replace(" ", "-")
        product_id = instance.id or "new"
        return f"{username}/{product_name}-{product_id}{ext}"
    else:
        product = instance.product
        username = product.seller.username if product.seller else "user"
        product_name = (product.name or "product").replace(" ", "-")
        return f"{username}/{product_name}-{instance.id}{ext}"


CURRENCY_CHOICES = [
    ("CUP", "Peso Cubano (CUP)"),
    ("MLC", "Peso Convertible (MLC)"),
    ("USD", "Dólar Estadounidense (USD)"),
    ("EUR", "Euro (EUR)"),
]


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="CUP")
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, blank=True, null=True
    )
    image = models.ImageField(upload_to=product_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    seller = models.ForeignKey("users.User", on_delete=models.CASCADE)

    def __str__(self):
        return f"Producto: {self.name}"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to=product_image_path)

    def __str__(self):
        return f"Imagen de {self.product.name}"


# class ProductsGroup(models.Model):
#     owner = models.ForeignKey("users.User", on_delete=models.CASCADE)
#     products = models.ManyToManyField(Product)

#     def __str__(self):
#         return f"Grupo de productos de: {self.owner}"
