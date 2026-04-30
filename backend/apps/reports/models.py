from django.db import models
from django.conf import settings


REASON_CHOICES = [
    ("inapropiated", "Contenido inapropiado"),
    ("fraud", "Posible fraude/estafa"),
    ("spam", "Spam o publicidad"),
    ("violated_terms", "Violación de términos"),
    ("other", "Otro"),
]

STATUS_CHOICES = [
    ("pending", "Pendiente"),
    ("reviewed", "Revisado"),
    ("resolved", "Resuelto"),
    ("rejected", "Rechazado"),
]


class Report(models.Model):
    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="reports"
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports"
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"Reporte de {self.reporter.username} sobre {self.product.name}"
