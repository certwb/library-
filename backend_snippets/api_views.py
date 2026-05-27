import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def add_to_cart(request):
    """
    API Endpoint: /api/cart/add/
    Сохраняет выбранную в чат-боте книгу в сессию пользователя.
    В реальном приложении здесь также будет логика сохранения в таблицу БД (Cart/Reservation),
    если пользователь авторизован.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            book_id = data.get("book_id")
            
            if not book_id:
                return JsonResponse({"error": "book_id is required"}, status=400)
            
            # Получаем текущий список выбранных книг из сессии
            selected_books = request.session.get('selected_books', [])
            
            # Добавляем книгу, если ее еще нет в списке
            if book_id not in selected_books:
                selected_books.append(book_id)
                request.session['selected_books'] = selected_books
                request.session.modified = True
                
            return JsonResponse({
                "status": "success", 
                "message": "Книга добавлена в полку",
                "total_selected": len(selected_books)
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)
