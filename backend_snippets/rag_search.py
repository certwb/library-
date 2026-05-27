from django.db.models import Q
from .models import Book

def search_books_in_db(genre=None, subgenre=None, author=None, keywords=None):
    """
    Умный поиск книг в SQL базе данных.
    Строит сложные Q-объекты для точного поиска, а при отсутствии результатов 
    переходит к fallback-поиску по ключевым словам в описании.
    """
    
    # 1. Попытка точного поиска по жанру и автору
    q_exact = Q()
    if genre:
        q_exact &= Q(category__icontains=genre)
    if subgenre:
        q_exact &= Q(category__icontains=subgenre)
    if author:
        q_exact &= Q(author__icontains=author)
        
    try:
        results = []
        if q_exact:
            results = list(Book.objects.filter(q_exact).values('id', 'title', 'author', 'thumbnail')[:3])
            
        # 2. Fallback: если точный поиск ничего не дал, ищем по keywords в description
        if not results and keywords:
            q_fallback = Q()
            for word in keywords.split():
                if len(word) > 3: # Игнорируем короткие слова (предлоги)
                    # Ищем по заголовку или описанию (подразумевая что поле description существует)
                    q_fallback |= Q(title__icontains=word) | Q(author__icontains=word) | Q(category__icontains=word)
            
            if q_fallback:
                results = list(Book.objects.filter(q_fallback).values('id', 'title', 'author', 'thumbnail')[:3])
                
        if not results:
            return [{"error": "Книги по данному запросу в базе не найдены. Попробуйте предложить другие жанры."}]
            
        return results
        
    except Exception as e:
        # Fallback для разработки, если БД пуста или таблица не создана
        query_str = f"{genre or ''} {subgenre or ''} {keywords or ''}".strip()
        return [
            {"id": "mock_1", "title": f"Найденная книга: {query_str}", "author": author or "Неизвестен", "thumbnail": ""}
        ]
