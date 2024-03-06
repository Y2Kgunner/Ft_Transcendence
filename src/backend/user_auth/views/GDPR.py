from user_auth.models import UserOTP
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from user_auth.models import WebUser
import random
from django.conf import settings
from django.core.mail import send_mail
import json
from django.views.decorators.http import require_http_methods
from user_auth.models import UserOTP

@csrf_exempt
def anonymize_user_data(request):
    if request.method == 'POST':
        user = request.user
        user.anonymize_user()
        return JsonResponse({'message': 'Your data has been anonymized.'}, status=200)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def initiate_delete_account(request):
    if request.method == 'POST':
        user = request.user
        otp = generate_otp()
        UserOTP.objects.create(user=user, otp=otp)
        send_otp_email(user, otp)
        return JsonResponse({'message': 'OTP sent to your email. Please verify to continue with account deletion.',
                            'otp':[otp]}, status=200)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_user_account(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        provided_otp = body.get('otp')
        
        if verify_otp_for_user(request.user, provided_otp):
            request.user.delete()
            return JsonResponse({'message': 'Your account has been permanently deleted.'}, status=200)
        else:
            print('provided_otp', provided_otp)

            return JsonResponse({'error': 'Invalid or expired OTP. Please try again.'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def generate_otp():
    return str(random.randint(100000, 999999))

def verify_otp_for_user(user, provided_otp):
 
    user_otp = UserOTP.objects.filter(user=user).order_by('-created_at').first()
    print('user_otp', user_otp)
    print(UserOTP.objects.filter(user=user).order_by('-created_at').first())
    if user_otp and user_otp.otp == provided_otp:
        user_otp.delete()
        return True
    return False 

def send_otp_to_user(user):
    otp = generate_otp()
    UserOTP.objects.create(user=user, otp=otp)
    send_otp_email(user, otp)


def send_otp_email(user, otp):
    subject = 'Confirm Your Account Deletion'
    message = f'Your OTP for account deletion is: {otp}'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [user.email]
    send_mail(subject, message, email_from, recipient_list)