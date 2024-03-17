from django.urls import path, include
from pong.views.__init__ import *


urlpatterns = [
    path('create', create_match, name='create_match'),
    path('delete_match', delete_match, name='delete_match'),
    path('delete_user_from_match', delete_user_from_match, name='delete_user_from_match'),
    path('list_all_matches', list_all_matches, name='list_all_matches'),
    path('player_match_history', player_match_history, name='player_match_history'),
    path('update_match', update_match, name='update_match'),
]