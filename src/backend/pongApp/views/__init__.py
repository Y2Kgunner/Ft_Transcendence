from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import jwt
import os
import secrets
import json

from pongApp.views.create import *
from pongApp.views.list_matches import *
from pongApp.views.finish_and_update_match import *
from pongApp.views.delete_match import *
from pongApp.views.leaderboard_pong import *