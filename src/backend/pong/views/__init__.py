from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import jwt
import os
import secrets
import json

from pong.views.create import create_match
from pong.views.list import list_matches