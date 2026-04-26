from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "phone", "date_joined"]

    def get_queryset(self):
        user = self.request.user
        return user
