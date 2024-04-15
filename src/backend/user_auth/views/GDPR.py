from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from user_auth.models import WebUser
import random
from django.conf import settings
from django.core.mail import send_mail
import json
from django.views.decorators.http import require_http_methods
from user_auth.views.twofa import generate_otp, send_otp_email, verify_otp_api

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
        request.session['delete_account_otp'] = otp
        request.session.set_expiry(300)
        send_otp_email(user, otp)
        return JsonResponse({'message': 'OTP sent to your email. Please verify to continue with account deletion.',
                             'otp': otp}, status=200)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_user_account(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        provided_otp = body.get('otp')
        stored_otp = request.session.get('delete_account_otp')
        
        if stored_otp and str(provided_otp) == stored_otp:
            del request.session['delete_account_otp']
            request.user.delete()
            return JsonResponse({'message': 'Your account has been permanently deleted.'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid or expired OTP. Please try again.'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
