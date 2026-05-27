from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    
    # Расширение каталога книг (Фокус на СНГ)
    publishing_region = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        help_text="Регион или страна издания (например, Казахстан, РФ, СНГ)"
    )
    is_popular_cis = models.BooleanField(
        default=False, 
        help_text="Флаг популярности на территории СНГ"
    )

    def __str__(self):
        return self.title
