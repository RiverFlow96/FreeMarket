from rest_framework import permissions, viewsets
from .models import Profile
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    serializer_class = UserSerializer
    queryset = Profile.objects.all()
    