from django.db import models
from apps.categories.models import Category


# Create your models here.
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="media/")
    seller = models.ForeignKey("users.User", on_delete=models.CASCADE)

    def __str__(self):
        return f"Producto: {self.name}"


# class ProductsGroup(models.Model):
#     owner = models.ForeignKey("users.User", on_delete=models.CASCADE)
#     products = models.ManyToManyField(Product)

#     def __str__(self):
#         return f"Grupo de productos de: {self.owner}"
