from django.contrib.auth.models import AbstractUser
from django.db import models


class Plan(models.TextChoices):
    FREE = "free", "Free"
    PLUS = "plus", "Plus"
    PRO = "pro", "Pro"


PLAN_LIMITS = {
    Plan.FREE: 3,
    Plan.PLUS: 5,
    Plan.PRO: 10,
}

PLAN_PRODUCT_DURATION_WEEKS = {
    Plan.FREE: 1,
    Plan.PLUS: 2,
    Plan.PRO: 3,
}


class NotificationPreference(models.TextChoices):
    EMAIL = "email", "Email"
    SMS = "sms", "SMS"
    BOTH = "both", "Email y SMS"
    IN_APP = "in_app", "Solo en la app"


# User Model
class User(AbstractUser):
    phone = models.IntegerField(blank=True, unique=True, null=True)
    address = models.CharField(max_length=255, blank=True, default="")
    is_logged = models.BooleanField(default=False)
    plan = models.CharField(
        max_length=10,
        choices=Plan.choices,
        default=Plan.FREE,
    )
    notification_preference = models.CharField(
        max_length=10,
        choices=NotificationPreference.choices,
        default=NotificationPreference.IN_APP,
    )

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    @property
    def product_limit(self):
        return PLAN_LIMITS.get(self.plan, 3)

    @property
    def product_count(self):
        return self.product_set.count()

    @property
    def can_add_product(self):
        return self.product_count < self.product_limit

    @property
    def product_duration_weeks(self):
        return PLAN_PRODUCT_DURATION_WEEKS.get(self.plan, 1)
