from django.http import JsonResponse, HttpResponseBadRequest
from django.core.mail import send_mail
from user_auth.models import WebUser
from django.contrib.auth.tokens import default_token_generator
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def password_reset(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8')) 
            username = data.get('username')
            email = data.get('email')
            user = WebUser.objects.get(username=username, email=email)
            token = default_token_generator.make_token(user)
            reset_link = f'http://localhost:8000/reset-password/{username}/{token}'

            send_mail('Password reset', reset_link, 'from@example.com', [email], fail_silently=False)
            return JsonResponse({'message': 'Password reset link sent to your email'})
        except WebUser.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")
    else:
        return JsonResponse({'error': 'This endpoint only supports POST requests.'}, status=405)
