from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.core.exceptions import ValidationError
from user_auth.jwt_utils import JWTHandler
from django.http import JsonResponse,FileResponse
from django.views import View
from functools import wraps
import json
import logging
from django.views.decorators.http import require_http_methods
from user_auth.forms import ProfilePictureForm
from django.contrib.auth.decorators import login_required
from user_auth.models import WebUser
# addition by aikram
from django.http import HttpResponse, JsonResponse
from base64 import b64encode
import os
from django.core.files.storage import default_storage
import base64
# # # # #

logger = logging.getLogger(__name__)

class UserProfileView(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(UserProfileView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        # print("Type of request.user:", type(request.user)) 
        # print("Is authenticated:", request.user.is_authen`ticated)  
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
        user = request.user  

        updated_at = user.updated_at.strftime('%Y-%m-%d %H:%M:%S') if user.updated_at else None
        created_at = user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else None

        user_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone_number, 
            'email': user.email,
            'address': user.address,
            'profile_picture': user.profile_picture,
            'join_date': user.created_at,
            'last_activitiy': user.updated_at,
            'twofa_enabled': user.twofa_enabled,
            'GDPR_agreement': user.GDPR_agreement,
            'games_played' : user.pong_games_played,
            'wins': user.pong_wins,
            'losses': user.pong_losses
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
                        return JsonResponse({'error': 'First name must be a non-empty string and cannot be numeric'}, status=410)
                if 'last_name' in data:
                    if not isinstance(data['last_name'], str) or data['last_name'].isdigit() or not data['last_name'].strip():
                        return JsonResponse({'error': 'Last name must be a non-empty string and cannot be numeric'}, status=420)
                if 'phone' in data:
                    if not isinstance(data['phone'], str) or not data['phone'].isdigit() or not data['phone'].strip():
                        return JsonResponse({'error': 'Phone must be a non-empty string of digits'}, status=430)
                user.first_name = data.get('first_name', user.first_name)
                user.last_name = data.get('last_name', user.last_name)
                user.phone_number = data.get('phone', user.phone_number)
                user.address = data.get('address', user.address)
                user.save()
                return JsonResponse({'message': 'Profile updated successfully'})
            except ValidationError as e:
                return JsonResponse({'error': str(e)}, status=440)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=450)


def save_profile_picture(user, file):
    data = file.read()
    base64_encoded = base64.b64encode(data).decode('utf-8')
    user.profile_picture = base64_encoded
    user.save()
    print("Saved profile picture for user:", user.username)
    return user



@csrf_exempt
def upload_profile_picture(request):
    if request.method == 'POST' and request.FILES.get('profile_picture'):
        try:
            token = request.COOKIES.get('jwt')
            user = JWTHandler.get_user_from_token(token)
            old_pic = user.profile_picture if user.profile_picture else 'None'
            file = request.FILES['profile_picture']
            data = file.read()
            encoded_data = base64.b64encode(data).decode('utf-8')
            user.profile_picture = encoded_data
            user.save()
            new_pic = user.profile_picture
            print(f"Profile picture changed from {old_pic} to {new_pic} for user: {user.username}")
            return JsonResponse({
                'message': 'Profile picture updated successfully.',
                'profile_picture': new_pic
            }, status=200)
        except Exception as e:
            print(f"Failed to update profile picture for user: {user.username}, error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'No file uploaded.'}, status=400)




@csrf_exempt
def delete_profile_picture(request):
    if request.method == 'POST':
        token = request.COOKIES.get('jwt')
        user = JWTHandler.get_user_from_token(token)
        user.profile_picture.delete()
        return JsonResponse({'message': 'Profile picture deleted successfully.'}, status=200)
    return JsonResponse({'error': 'Method not allowed'}, status=405)



# addition by aikram
def image_to_base64(image_path):
    with default_storage.open(image_path, 'rb') as f:
        image_data = f.read()
    return b64encode(image_data).decode('utf-8')


@require_http_methods(["GET"])
def get_profile_picture(request):
    token = request.COOKIES.get('jwt')
    user = JWTHandler.get_user_from_token(token)
    # user = request.
    if not user.profile_picture:
        return JsonResponse({'error': 'No profile picture set.', 'profile_picture': None}, status=200)
    # Return the base64 string directly
    return JsonResponse({'profile_picture_base64': user.profile_picture}, status=200)
