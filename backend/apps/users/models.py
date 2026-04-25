from datetime import date
from django.db import models

# User Model
class Profile(models.Model): 
    username = models.CharField(max_length=200)
    password = models.CharField(max_length=200)
    email = models.CharField(max_length=200)
    number = models.IntegerField(blank=True)
    is_logged = models.BooleanField(default=False)
    date_joined = models.DateField(default=date.today)
    
    def __str__(self):
        return f"User: {self.username}"