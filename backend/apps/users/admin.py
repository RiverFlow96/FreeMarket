from django.contrib.auth.admin import UserAdmin
from django.contrib import admin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "phone", "is_staff")
    fieldsets = UserAdmin.fieldsets
