from django.utils.timezone import now
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pongApp.models import Match
import json
from pongApp.models import Match, update_guest_stats, update_player_stats

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
    winner_name = data.get('winner')

    if not all([match_id, score_player is not None, score_guest_player1 is not None, winner_name]):
        return JsonResponse({'error': 'Missing required fields'}, status=400)

    try:
        match = Match.objects.get(id=match_id)
        match.score_player = score_player
        match.score_guest_player1 = score_guest_player1
        match.score_guest_player2 = score_guest_player2
        match.winner = winner_name
        match.completed = True
        match.save()

        match.save_guest_scores(match.guest_player1, score_guest_player1)
        match.save_guest_scores(match.guest_player2, score_guest_player2)

        if match.player:
            try:
                update_player_stats(winner_name, match.player.username, match)
            except (AttributeError, Exception) as e:
                print(f"Error updating player stats: {e}")

        if match.guest_player1:
            update_guest_stats(winner_name, match.guest_player1, match)

            if winner_name != match.guest_player1 and match.guest_player2:
                update_guest_stats(winner_name, match.guest_player2, match)

    except Match.DoesNotExist:
        return JsonResponse({'error': 'Match not found'}, status=404)
    return JsonResponse({'message': 'Match updated successfully', 'match_id': match.id}, status=200)
