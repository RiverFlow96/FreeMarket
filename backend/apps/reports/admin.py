from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "reporter", "reason", "status", "created_at"]
    list_filter = ["status", "reason", "created_at"]
    search_fields = ["product__name", "reporter__username"]
    readonly_fields = ["created_at"]
