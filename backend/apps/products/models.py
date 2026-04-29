from django.db import models
from apps.categories.models import Category


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, blank=True, null=True
    )
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    seller = models.ForeignKey("users.User", on_delete=models.CASCADE)

    def __str__(self):
        return f"Producto: {self.name}"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url


# class ProductsGroup(models.Model):
#     owner = models.ForeignKey("users.User", on_delete=models.CASCADE)
#     products = models.ManyToManyField(Product)

#     def __str__(self):
#         return f"Grupo de productos de: {self.owner}"
