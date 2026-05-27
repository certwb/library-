from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True, help_text="Текстовое описание пользователя")
    reading_goal = models.IntegerField(default=12, help_text="Читательская цель (книг в год)")
    preferred_genres = models.JSONField(default=list, blank=True, help_text="Предпочитаемые жанры в формате списка строк")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Профиль {self.user.username}"
