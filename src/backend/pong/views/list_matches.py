from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pong.models import Match
import json

@csrf_exempt
@require_http_methods(["GET"])
def list_all_matches(request):
    matches = Match.objects.filter(is_deleted=False).values()
    return JsonResponse(list(matches), safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def player_match_history(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    player_id = data.get('player_id')
    if not player_id:
        return JsonResponse({'error': 'Missing player_id'}, status=400)
    try:
        matches = Match.objects.filter(player_id=player_id)
    except Match.DoesNotExist:
        return JsonResponse({'error': 'No matches found for the given player_id'}, status=404)
    matches_data = list(matches.values(
        'id', 'guest_player1', 'guest_player2', 'match_date','score_player', 'score_guest_player1', 'score_guest_player2', 'winner'))
    return JsonResponse({'matches': matches_data}, safe=False, status=200)
