from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin 
from user_auth.models import WebUser
from django.http import JsonResponse
from .jwt_utils import JWTHandler
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
import datetime
import re

from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from .jwt_utils import JWTHandler
import re

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response
        self.excluded_patterns = [
            re.compile(r'^/api/login$'),
            re.compile(r'^/api/register$'),
            re.compile(r'^/api/fortytwo$'),
            re.compile(r'^/api/logout$'),
            re.compile(r'^/api/oauth_callback$'),
            re.compile(r'^/api/auth_status$'),
            re.compile(r'^/api/proceed_with_login$'),
            re.compile(r'^/api/finalize_login$'),
            re.compile(r'^/api/check_2fa_status$'),
            re.compile(r'^/api/verify_otp$'),
            re.compile(r'^/api/forgot_password_send_email$'),
            re.compile(r'^/api/reset_password/.+/$'),
        ]

    def __call__(self, request):
        if any(pattern.match(request.path_info) for pattern in self.excluded_patterns):
            return self.get_response(request)
        return self.authenticate_request(request)
    
    def authenticate_request(self, request):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else request.COOKIES.get('jwt', None)
        if token:
            try:
                payload = JWTHandler.decode_jwt(token)
                user = JWTHandler.get_user_from_token(token)
                if user:
                    request.user = user
                    request.auth = payload
                    return self.get_response(request)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)  
        return JsonResponse({'error': 'Authentication required'}, status=401)


class UpdateLastActivityMiddleware(MiddlewareMixin):
    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request, 'auth'):
                try:
                    token_expiration = datetime.datetime.fromtimestamp(request.auth.get('exp'), tz=timezone.utc)
                    if timezone.now() > token_expiration:
                        request.user.is_active = False
                    else:
                        request.user.last_activity = timezone.now()
                        request.user.save(update_fields=['last_seen'])
                except Exception as e:
                    print(f"Error updating user's last activity: {e}")
        return self.get_response(request)


class LogHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(request.headers)
        return self.get_response(request)