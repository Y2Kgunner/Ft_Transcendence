from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from user_auth.jwt_utils import JWTHandler
from django.http import JsonResponse
from django.views import View
from functools import wraps
import json
import logging

logger = logging.getLogger(__name__)

# def require_jwt_auth(view_func):
#     @wraps(view_func)
#     def _wrapped_view(request, *args, **kwargs):
#         auth_header = request.headers.get('Authorization', '')
#         token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else None
#         if not token:
#             token = request.COOKIES.get('auth_token', None)
#             print("this is the token")
#             print(token)
#         logger.info(f"JWT Token: {token}")
#         if token:
#             user = JWTHandler.get_user_from_token(token)
#             if user and user.is_active:  # Ensure user is active
#                 request.user = user  # Manually set the user
#                 return view_func(request, *args, **kwargs)
#         return JsonResponse({'error': 'Authentication required'}, status=401)
#     return _wrapped_view

# def require_jwt_auth(view_func):
#     @wraps(view_func)
#     def _wrapped_view(request, *args, **kwargs):
#         # Try extracting the JWT token from cookies directly
#         token = request.COOKIES.get('jwt', None)

#         if token:
#             try:
#                 user = JWTHandler.get_user_from_token(token)
#                 if user and user.is_active:
#                     request.user = user
#                     return view_func(request, *args, **kwargs)
#             except Exception as e:
#                 # Log the error or handle it as per your requirement
#                 print("from e" , e)
#                 pass
#         # Respond with an error if authentication fails
#         return JsonResponse({'error': 'Authentication required'}, status=401)
#     return _wrapped_view


class UserProfileView(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(UserProfileView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        user = request.user
        updated_at = user.updated_at.strftime('%Y-%m-%d %H:%M:%S') if user.updated_at else None
        created_at = user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else None

        user_data = {
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone_number, 
            'email': user.email,
            'address': user.address,
            'profile_picture': user.profile_picture.url if user.profile_picture else '',
            'join_date': user.created_at,
            'last_activitiy': user.updated_at,
            'twofa_enabled': user.twofa_enabled,
            'GDPR_agreement': user.GDPR_agreement,
        }
        return JsonResponse(user_data)

    def post(self, request, *args, **kwargs):
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    
    def patch(self, request, *args, **kwargs):
            try:
                user = request.user
                data = json.loads(request.body)
                if 'first_name' in data:
                    if not isinstance(data['first_name'], str) or data['first_name'].isdigit() or not data['first_name'].strip():
                        return JsonResponse({'error': 'First name must be a non-empty string and cannot be numeric'}, status=400)
                if 'last_name' in data:
                    if not isinstance(data['last_name'], str) or data['last_name'].isdigit() or not data['last_name'].strip():
                        return JsonResponse({'error': 'Last name must be a non-empty string and cannot be numeric'}, status=400)
                if 'phone' in data:
                    if not isinstance(data['phone'], str) or not data['phone'].isdigit() or not data['phone'].strip():
                        return JsonResponse({'error': 'Phone must be a non-empty string of digits'}, status=400)
                user.first_name = data.get('first_name', user.first_name)
                user.last_name = data.get('last_name', user.last_name)
                user.phone_number = data.get('phone', user.phone_number)
                user.address = data.get('address', user.address)
                user.save()
                return JsonResponse({'message': 'Profile updated successfully'})
            except ValidationError as e:
                return JsonResponse({'error': str(e)}, status=400)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
