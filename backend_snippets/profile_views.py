import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# from django.contrib.auth.decorators import login_required
from .profile_models import UserProfile

@csrf_exempt
# @login_required # Закомментировано для удобства тестирования фронтенда
def update_profile(request):
    """
    Обновление основной информации профиля (био, жанры, цель).
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # В реальном приложении: profile = request.user.profile
            # Для мокапа берем первого попавшегося или создаем
            profile, created = UserProfile.objects.get_or_create(user_id=1) 
            
            if 'bio' in data:
                profile.bio = data['bio']
            if 'reading_goal' in data:
                profile.reading_goal = int(data['reading_goal'])
            if 'preferred_genres' in data:
                profile.preferred_genres = data['preferred_genres']
                
            profile.save()
            
            return JsonResponse({"status": "success", "message": "Профиль успешно обновлен"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

@csrf_exempt
def change_password(request):
    """
    API для смены пароля.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            old_password = data.get('old_password')
            new_password = data.get('new_password')
            
            if not old_password or not new_password:
                return JsonResponse({"status": "error", "message": "Необходимы старый и новый пароли"}, status=400)
                
            # Валидация старого пароля и установка нового
            # user = request.user
            # if user.check_password(old_password):
            #     user.set_password(new_password)
            #     user.save()
            
            return JsonResponse({"status": "success", "message": "Пароль успешно изменен"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

@csrf_exempt
def upload_avatar(request):
    """
    Загрузка аватара.
    """
    if request.method == "POST" and request.FILES.get('avatar'):
        avatar = request.FILES['avatar']
        # Проверка размера, формата
        if avatar.size > 5 * 1024 * 1024:
            return JsonResponse({"status": "error", "message": "Файл слишком большой"}, status=400)
            
        # Сохранение
        # profile = request.user.profile
        # profile.avatar = avatar
        # profile.save()
        
        return JsonResponse({"status": "success", "message": "Аватар загружен", "url": "/media/avatars/new_avatar.jpg"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)
