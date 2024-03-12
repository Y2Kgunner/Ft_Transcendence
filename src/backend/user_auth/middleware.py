from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin 
from user_auth.models import WebUser
from django.http import JsonResponse
from .jwt_utils import JWTHandler
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
import datetime

class JWTAuthenticationMiddleware(MiddlewareMixin):

    def __init__(self, get_response):
        self.get_response = get_response
        self.excluded_paths = ['/api/login', '/api/register','/api/login','/api/fortytwo',\
                               '/api/oauth_callback','/api/auth_status','/api/proceed_with_login','/api/finalize_login','/api/check_2fa_status', '/api/verify_otp']

    # def __call__(self, request):
    #     print("JWT Middleware called")  # debugging

    def process_request(self, request):
        # Skip middleware for excluded paths
        if request.path_info in self.excluded_paths:
            #keep this to bypass auth call 
            if request.path_info == '/api/auth_status':
                return self.get_response(request)
            return None
        return self.authenticate_request(request)
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        # in case server side rendering is used
        pass

    # def process_view(self, request, view_func, view_args, view_kwargs):
    #     # Skip middleware for excluded paths
    #     if request.path_info in self.excluded_paths:
    #         if request.path_info == '/api/auth_status':
    #             return view_func(request)
    #         return None

    def authenticate_request(self, request):
        auth_header = request.headers.get('Authorization', '')
        token = None

        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            token = request.COOKIES.get('jwt', None)

        if token:
            payload = JWTHandler.decode_jwt(token)
            if 'error' not in payload:
                user = JWTHandler.get_user_from_token(token)
                if user:
                    request.user = user
                    request.auth = payload
                    return None
                else:
                    return JsonResponse({'error': 'User not found'}, status=401)
            else:
                return JsonResponse({'error': payload['error']}, status=401)
        else:
            return JsonResponse({'error': 'Authentication required'}, status=401)

class UpdateLastActivityMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.user.is_authenticated and hasattr(request, 'auth') and 'exp' in request.auth:
            try:
                token_expiration = datetime.datetime.fromtimestamp(request.auth['exp'], tz=timezone.utc)
                current_time = timezone.now()
                if current_time > token_expiration:
                    request.user.is_active = False
                else:
                    request.user.last_activity = current_time
                request.user.save()
            except Exception as e:
                print(f"Error updating user's last activity: {e}")