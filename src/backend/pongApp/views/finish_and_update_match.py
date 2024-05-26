from django.utils.timezone import now
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pongApp.models import Match
import json
from pongApp.models import Match, update_guest_stats, update_player_stats
from django.db import transaction

@csrf_exempt
@require_http_methods(["POST"])
def update_match(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    match_id = data.get('match_id')
    score_player = data.get('score_player')
    score_guest_player1 = data.get('score_guest_player1')
    score_guest_player2 = data.get('score_guest_player2', 0)
    is_draw = data.get('is_draw')
    if not all([match_id, score_player is not None, score_guest_player1 is not None]):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
    try:
        with transaction.atomic():
            match = Match.objects.select_for_update().get(id=match_id)
            match.score_player = score_player
            match.score_guest_player1 = score_guest_player1
            match.score_guest_player2 = score_guest_player2
            match.is_draw = is_draw
            if is_draw:
                match.winner = "darw"
            else:
                match.winner = data.get('winner')
            match.game_completed = True
            match.save()

            if match.player:
                update_player_stats(match.winner, match.player.username, match)

            if match.guest_player1:
                update_guest_stats(match.winner, match.guest_player1, match)

                if match.guest_player2:
                    update_guest_stats(match.winner, match.guest_player2, match)

    except Match.DoesNotExist:
        return JsonResponse({'error': 'Match not found'}, status=404)
    return JsonResponse({'message': 'Match updated successfully', 'match_id': match.id}, status=200)

