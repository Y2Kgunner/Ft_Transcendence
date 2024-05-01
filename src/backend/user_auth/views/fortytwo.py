from django.shortcuts import redirect
from django.http import HttpResponse
from django.http import HttpResponseRedirect
import requests
from user_auth.models import WebUser
from user_auth.jwt_utils import JWTHandler
from django.shortcuts import redirect
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth import get_user_model
import requests
from django.views.decorators.http import require_GET

def fortytwo(request):
    """
    Redirect to the 42 OAuth login page.
    """
    oauth_url = f'https://api.intra.42.fr/oauth/authorize?client_id={settings.CLIENT_ID_42}&redirect_uri={settings.CALLBACK_URL_42}&response_type=code'
    return redirect(oauth_url)

@require_GET
def oauth_callback(request):
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Authorization code is missing'}, status=400)

    token_url = 'https://api.intra.42.fr/oauth/token'
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': settings.CLIENT_ID_42,
        'client_secret': settings.CLIENT_SECRET_42,
        'code': code,
        'redirect_uri': settings.CALLBACK_URL_42,
    }
    
    try:
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        access_token = token_response.json().get('access_token')
        
        user_info_url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {access_token}'}
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info_response.raise_for_status()
        user_info = user_info_response.json()
        
        UserModel = get_user_model()
        user, created = UserModel.objects.get_or_create(username=user_info['login'], defaults={
            'email': user_info['email'],
            'first_name': user_info['first_name'],
            'last_name': user_info['last_name'],
            'twofa_enabled': False,
            'is_staff': True
        })
        if created:
            user.set_unusable_password()
            user.save()

        jwt_token = JWTHandler.generate_jwt(user)
        response = JsonResponse({
            'success': True,
            'message': 'Authentication successful',
            'user_id': user.id,
            'redirect_url': 'https://127.0.0.1:443',
            'jwt': jwt_token
        })
        response.set_cookie(
            key='jwt',
            value=jwt_token,
            max_age=3600,
            httponly=False,
            secure=True,
            samesite='Lax'
        )
        return response
    except requests.RequestException as e:
        return JsonResponse({'error': 'Failed during OAuth processing', 'detail': str(e)}, status=500)



@csrf_exempt
@require_http_methods(["POST"])
def set_password(request, user_id):
    try:
        user = WebUser.objects.get(pk=user_id)
    except WebUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    data = request.POST
    password = data.get('password')
    if password:
        user.set_password(password)
        user.save()
        return JsonResponse({'message': 'Password set successfully'})
    else:
        return JsonResponse({'error': 'Password is required'}, status=400)

# UID
# u-s4t2ud-d0c4077a43cbefbff3d67add430fbc7edaadbc4522099efc1eb7a28773e0037a
# Secret
# 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

