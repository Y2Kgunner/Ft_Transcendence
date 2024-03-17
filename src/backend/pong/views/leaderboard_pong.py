from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from user_auth.models import WebUser
from django.db.models import F
from django.db.models import Value, CharField
from itertools import chain
from django.db.models import Value, CharField, F
from pong.models import WebUser, GuestGameStats
from django.db.models.functions import Cast

def generate_leaderboard(sort_key):
    user_stats = WebUser.objects.annotate(
        name=F('username'),
        category=Value('User', output_field=CharField()),
        games_played=F('pong_games_played'),
        wins=F('pong_wins'),
        losses=F('pong_losses'),
        scored=F('pong_scored'),
    ).values('name', 'category', 'games_played', 'wins', 'losses', 'scored')

    guest_stats = GuestGameStats.objects.annotate(
        name=F('guest_name'),
        category=Value('Guest', output_field=CharField()),
        games_played=F('games_played'),  
        wins=F('wins'),  
        losses=F('losses'),  
        scored=F('scored'),  
    ).values('name', 'category', 'games_played', 'wins', 'losses', 'scored')

    combined_stats = list(user_stats) + list(guest_stats)

    if sort_key == 'wins':
        sorted_stats = sorted(combined_stats, key=lambda x: (-x['wins'], -x['scored']))
    elif sort_key == 'scored':
        sorted_stats = sorted(combined_stats, key=lambda x: (-x['scored'], -x['wins']))

    return sorted_stats


@require_http_methods(["GET"])
def leaderboard_by_wins(request):
    leaderboard_data = generate_leaderboard(sort_key='wins')
    return JsonResponse(leaderboard_data, safe=False)

@require_http_methods(["GET"])
def leaderboard_by_scored(request):
    leaderboard_data = generate_leaderboard(sort_key='scored')
    return JsonResponse(leaderboard_data, safe=False)
