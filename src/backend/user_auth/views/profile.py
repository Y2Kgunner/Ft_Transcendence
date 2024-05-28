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

logger = logging.getLogger(__name__)


class UserProfileView(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(UserProfileView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        # print("Type of request.user:", type(request.user)) 
        # print("Is authenticated:", request.user.is_authenticated)  
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


def save_profile_picture(user, file):
    form = ProfilePictureForm({'username': user.username}, {'profile_picture': file}, instance=user)
    if form.is_valid():
        user = form.save()
        print("Saved profile picture for user:", user.username)
        print("New profile picture path:", user.profile_picture.url)
        return user
    else:
        raise ValueError(form.errors)

@csrf_exempt
def upload_profile_picture(request):
    if request.method == 'POST' and request.FILES.get('profile_picture'):
        try:
            user = request.user
            user.profile_picture = request.FILES['profile_picture']
            user.save()
            return JsonResponse({'message': 'Profile picture updated successfully.', 'profile_picture_url': user.profile_picture.url}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'No file uploaded.'}, status=400)


@csrf_exempt
def delete_profile_picture(request):
    if request.method == 'POST':
        user = request.user
        user.profile_picture.delete()
        return JsonResponse({'message': 'Profile picture deleted successfully.'}, status=200)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@require_http_methods(["GET"])
def get_profile_picture(request):
    user = request.user
    if not user.profile_picture:
        return JsonResponse({'error': 'No profile picture set.', 'profile_picture_url': None}, status=200)

    if not user.profile_picture.storage.exists(user.profile_picture.name):
        default_picture_url = request.build_absolute_uri('/media/default-profile-picture.jpg')
        return JsonResponse({'error': 'Profile picture not found.', 'profile_picture_url': default_picture_url}, status=302)

    picture_url = request.build_absolute_uri(user.profile_picture.url)
    print("Profile picture URL:", picture_url)
    return JsonResponse({'profile_picture_url': picture_url}, status=200)
