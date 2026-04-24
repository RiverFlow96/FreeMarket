from django.db import models
from django.contrib.auth.models import User 

# User Model
class Profile(models.Model): 
    username = models.CharField(max_length=200)
    password = models.CharField(max_length=200)
    email = models.CharField(max_length=200)
    is_logged = models.BooleanField(default=False)
    