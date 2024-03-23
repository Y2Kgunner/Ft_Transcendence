import json
from user_auth.models import WebUser
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseNotAllowed
import re
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model
import logging

'''
group of helper functions to handle the registration process
'''

def get_data(request):
    data = json.loads(request.body)
    username = data['username']
    password = data['password']
    email = data['email']
    return username, password, email

def is_username_valid(username):
    username_policy = re.compile(r'^[a-zA-Z]{4,}$')
    if not username_policy.match(username):
        return 'Username must be at least 4 characters long and can only contain alphanumeric characters, dots, underscores, or hyphens.'
    return None

'''
tha main registration function 
params: request ( must be a POST request and contain a valid JSON payload with username, password, and email)
returns: JsonResponse
'''

def is_password_strong(password):
    password_policy = re.compile(r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$')
    if not password_policy.match(password):
        return 'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number.'
    return None

def is_email_valid(email):
    email_policy = re.compile(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_policy.match(email):
        return 'Invalid email format.'
    if "@" not in email:
        return 'Email must contain an "@" symbol.'
    return None

def sanitize_data(username, password, email):
    if not username or not password or not email:
        return 'All fields are required: username, password, email'
    username = username.strip()
    email = email.strip()
    password = password.strip()
    if error := is_email_valid(email):
        return error
    if error := is_username_valid(username):
        return error
    if error := is_password_strong(password):
        return error
    return None

@require_POST
@csrf_exempt
def register(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        error = sanitize_data(username, password, email)
        if error:
            return JsonResponse({'error': error}, status=400)
        if get_user_model().objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        if get_user_model().objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        user = get_user_model().objects.create_user(username=username, email=email, password=password)
        return JsonResponse({'message': 'Registration successful', 'user_id': user.id}, status=201)
    except IntegrityError as e:
        return JsonResponse({'error': 'Could not create user due to an integrity error.'}, status=500)
    except Exception as e:
        return JsonResponse({'error': 'Internal server error. Please try again later.'}, status=500)

