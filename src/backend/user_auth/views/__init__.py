from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import jwt
import os
import secrets
import json

from user_auth.views.register import *
from user_auth.views.login import *
from user_auth.views.logout import *
from user_auth.views.test_view import *
from user_auth.views.password_reset import *
from user_auth.views.twofa import *
from user_auth.views.profile import *
from user_auth.views.fortytwo import *
from user_auth.views.GDPR import *
from user_auth.views.auth import *