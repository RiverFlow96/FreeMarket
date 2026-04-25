from rest_framework import serializers
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"
    def get_queryset(self):
        user = self.request.user
        return user

