from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import jwt
import os
import secrets
import json
from user_auth.models import *
# Create your views here.

def my_view(request):
    data = {"hello" : "amor"}
    return JsonResponse(data)


def genrate_secret_key():
    secret_key = secrets.token_urlsafe(32)
    return secret_key

@csrf_exempt
def register(request):
    pass

@csrf_exempt
def login(request):
    pass

def logout(request):
    pass
