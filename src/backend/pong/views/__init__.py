from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import jwt
import os
import secrets
import json

from pong.views.create import *
from pong.views.list_matches import *
from pong.views.finish_and_update_match import *
from pong.views.delete_match import *