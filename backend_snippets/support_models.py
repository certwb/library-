from django.db import models
from django.contrib.auth.models import User

class SupportTicket(models.Model):
    STATUS_CHOICES = (
        ('open', 'Открыт'),
        ('in_progress', 'В работе'),
        ('resolved', 'Решен'),
        ('closed', 'Закрыт')
    )
    
    CATEGORY_CHOICES = (
        ('bug', 'Техническая ошибка'),
        ('account', 'Проблема с аккаунтом'),
        ('content', 'Контент/Книги'),
        ('other', 'Другое')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets', null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Тикет #{self.id} - {self.get_status_display()}"
