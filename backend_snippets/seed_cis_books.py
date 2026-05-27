from django.core.management.base import BaseCommand
from myapp.models import Book  # Замените 'myapp' на название вашего приложения

class Command(BaseCommand):
    help = 'Заполняет базу данных популярными книгами из СНГ'

    def handle(self, *args, **kwargs):
        books_data = [
            {"title": "Путь Абая", "author": "Мухтар Ауэзов", "publishing_region": "Казахстан", "is_popular_cis": True},
            {"title": "Кочевники", "author": "Ильяс Есенберлин", "publishing_region": "Казахстан", "is_popular_cis": True},
            {"title": "Слова назидания", "author": "Абай Кунанбаев", "publishing_region": "Казахстан", "is_popular_cis": True},
            {"title": "Мастер и Маргарита", "author": "Михаил Булгаков", "publishing_region": "Россия", "is_popular_cis": True},
            {"title": "Преступление и наказание", "author": "Федор Достоевский", "publishing_region": "Россия", "is_popular_cis": True},
            {"title": "Кровь и пот", "author": "Абдижамил Нурпеисов", "publishing_region": "Казахстан", "is_popular_cis": True},
            {"title": "За нами Москва", "author": "Бауыржан Момышулы", "publishing_region": "Казахстан", "is_popular_cis": True},
            {"title": "Тарас Бульба", "author": "Николай Гоголь", "publishing_region": "Украина/Россия", "is_popular_cis": True},
            {"title": "Пикник на обочине", "author": "Братья Стругацкие", "publishing_region": "Россия", "is_popular_cis": True},
            {"title": "Манкурт", "author": "Чингиз Айтматов", "publishing_region": "Кыргызстан", "is_popular_cis": True},
        ]
        
        count = 0
        for data in books_data:
            obj, created = Book.objects.get_or_create(**data)
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Успешно добавлено {count} новых книг из СНГ!'))
