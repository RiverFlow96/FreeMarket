import os
from django.db import models
from django.utils import timezone
from apps.categories.models import Category


PLAN_PRODUCT_DURATION_WEEKS = {
    "free": 1,
    "plus": 2,
    "pro": 3,
}

GRACE_PERIOD_HOURS = 24


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
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Producto: {self.name}"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url

    @property
    def is_expired(self):
        if not self.is_active:
            return True
        if self.expires_at and self.expires_at < timezone.now():
            return True
        return False

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        if not self.expires_at and self.seller_id:
            weeks = PLAN_PRODUCT_DURATION_WEEKS.get(self.seller.plan, 1)
            self.expires_at = timezone.now() + timezone.timedelta(weeks=weeks)
        super().save(*args, **kwargs)

    def check_and_expire(self):
        if self.is_active and self.expires_at and self.expires_at < timezone.now():
            self.is_active = False
            self.save(update_fields=["is_active"])
            return True
        return False


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
