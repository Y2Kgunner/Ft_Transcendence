from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from user_auth.models import WebUser
from django.db.models import F
from itertools import chain
from django.db.models import Value, CharField, F
from pongApp.models import WebUser, GuestGameStats
from django.db.models.functions import Coalesce
from django.db.models import  IntegerField
from django.db.models.functions import Cast

def generate_leaderboard(sort_key):
    user_stats = WebUser.objects.annotate(
        name=F('username'),
        category=Value('User', output_field=CharField()),
        games_played=F('pong_games_played'),
        wins=F('pong_wins'),
        losses=F('pong_losses'),
        scored=Cast('pong_scored', IntegerField()),
    ).values('name', 'category', 'games_played', 'wins', 'losses', 'scored')

    guest_stats = GuestGameStats.objects.annotate(
        guest_games_played=Coalesce(F('games_played'), 0),
        guest_wins=Coalesce(F('wins'), 0),
        guest_losses=Coalesce(F('losses'), 0),
        guest_scored=Cast('scored', IntegerField()),
    ).values('guest_name', 'guest_games_played', 'guest_wins', 'guest_losses', 'guest_scored')

    combined_stats = list(user_stats) + list(guest_stats)

    if sort_key == 'wins':
        sorted_stats = sorted(combined_stats, key=lambda x: (-x.get('guest_wins', 0), -x.get('scored', 0), x.get('guest_name', '')))
    elif sort_key == 'scored':
        sorted_stats = sorted(combined_stats, key=lambda x: (-x.get('guest_scored', 0), -x.get('guest_wins', 0), x.get('guest_name', '')))
    return sorted_stats

# count is for the frontend to know how many items are in the list and genrate table based on that 
@require_http_methods(["GET"])
def leaderboard_by_wins(request):
    leaderboard_data = generate_leaderboard(sort_key='wins')
    leaderboard_data_with_count = {'count': len(leaderboard_data), 'data': leaderboard_data}
    return JsonResponse(leaderboard_data_with_count, safe=False)

@require_http_methods(["GET"])
def leaderboard_by_scored(request):
    leaderboard_data = generate_leaderboard(sort_key='scored')
    leaderboard_data_with_count = {'count': len(leaderboard_data), 'data': leaderboard_data}
    return JsonResponse(leaderboard_data_with_count, safe=False)
