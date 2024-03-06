from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth import logout as django_logout

@csrf_exempt
@require_POST
def logout(request):
    if request.method == 'POST':
        django_logout(request)
        user = request.user
        if user.is_authenticated:
            user.is_active = False
            user.save()
        response = JsonResponse({'status': 'logout of success'})
        response.delete_cookie('jwt')
        return response
    else:
        return HttpResponseNotAllowed(['POST'], "This endpoint only supports POST requests.")