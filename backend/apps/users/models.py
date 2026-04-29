from django.contrib.auth.models import AbstractUser
from django.db import models


# User Model
class User(AbstractUser):
    phone = models.IntegerField(blank=True, unique=True, null=True)
    address = models.CharField(max_length=255, blank=True, default="")
    is_logged = models.BooleanField(default=False)

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
