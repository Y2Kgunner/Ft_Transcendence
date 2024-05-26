from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from user_auth.jwt_utils import JWTHandler
from django.conf import settings
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt
import json
from email.message import EmailMessage
import ssl
import smtplib

def send_email(user, message):
    em = EmailMessage()
    em['From'] = settings.EMAIL_HOST_USER
    em['To'] = user.email
    em['Subject'] = 'password reset link'
    em.set_content(f'{message}')
    context = ssl.create_default_context()
    with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
        server.starttls(context=context)
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        server.send_message(em) 
        server.quit()

@csrf_exempt
@require_POST
def forgot_password_send_email(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)

        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email=email)
        #add this for the case where the email is not found // user should not know if the email exists or not
        except UserModel.DoesNotExist:
            return JsonResponse({'message': 'If an account with this email exists, a reset link has been sent.'}, status=200)
        token = JWTHandler.generate_jwt(user)
        reset_url = f"https://127.0.0.1:443/api/reset_password/{token}/"
        send_email(user, f'Click the link to reset your password: https://127.0.0.1:443/api/reset_password/{user.id}/')
        #response = JsonResponse({'message': 'If an account with this email exists, a reset link has been sent.'}, status=200)
        #for testing 
        response =  JsonResponse({"token":token}, status=200)
        return response
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def reset_password(request, token):
    try:
        payload = JWTHandler.decode_jwt(token)
        if 'error' in payload:
            return JsonResponse({'error': payload['error']}, status=400)

        user_id = payload['user_id']
        UserModel = get_user_model()
        user = UserModel.objects.get(id=user_id)

        data = json.loads(request.body)
        new_password = data.get('new_password')
        if not new_password:
            return JsonResponse({'error': 'New password is required'}, status=400)

        user.set_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password has been reset successfully'}, status=200)
    except UserModel.DoesNotExist:
        return JsonResponse({'error': 'Invalid token or user does not exist'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
