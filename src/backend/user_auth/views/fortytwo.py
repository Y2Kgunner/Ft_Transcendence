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

def fortytwo(request):
    """
    Redirect to the 42 OAuth login page.
    """
    oauth_url = f'https://api.intra.42.fr/oauth/authorize?client_id={settings.CLIENT_ID_42}&redirect_uri={settings.CALLBACK_URL_42}&response_type=code'
    return redirect(oauth_url)


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
    except requests.RequestException as e:
        error_detail = e.response.text if e.response else str(e)
        return JsonResponse({'error': 'Failed to retrieve access token', 'detail': error_detail}, status=500)

    try:
        user_info = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        ).json()
    except requests.RequestException:
        return JsonResponse({'error': 'Failed to retrieve user information'}, status=500)

    try:
        user = WebUser.objects.get(email=user_info['email'])
        
    except WebUser.DoesNotExist:
        return JsonResponse({'error': 'No account found for this user. Please register first.'}, status=404)

    jwt_token = JWTHandler.generate_jwt(user)
    response_data = {
        'success': True,
        'message': 'Authentication successful',
        'redirect_url': 'https://127.0.0.1:443'
    }
    response = JsonResponse(response_data)
    response.set_cookie(
        key='jwt',
        value=jwt_token,
        max_age=3600,
        httponly=True,
        secure=True,
        samesite='None'
    )
    return response

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

