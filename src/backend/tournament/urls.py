from django.urls import path, include
from .views.__init__ import *


urlpatterns = [
    path('create', create_tournament, name='create_tournament'),
    path('detail', get_active_tournament_for_user, name='get_tournament_detail'),
    path('start', start_tournament, name='start_tournament'),
    path('arrange-matches/<int:tournament_id>', arrange_matches, name='arrange_matches'),
    path('complete/<int:tournament_id>', complete_tournament, name='complete_tournament'),
    path('get-next-match/<int:tournament_id>', get_next_match, name='get_next_match'),    
    path('submit', submit_match_result_by_details, name='submit_match_result_by_details'),
    path('update-match-result/<int:match_id>/', update_match_result, name='update_match_result'),
    path('get_second_round_matches/<int:tournament_id>/<int:round>', get_second_round_matches, name='get_second_round_matches')
]