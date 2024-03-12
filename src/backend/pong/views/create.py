import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pong.models import Match


@csrf_exempt
@require_http_methods(["POST"])
def create_match(request):
    data = json.loads(request.body)
    player_id = data.get('player_id')
    guest_player1 = data.get('guest_player1')
    guest_player2 = data.get('guest_player2', None)  
    score_player = data.get('score_player')
    score_guest_player1 = data.get('score_guest_player1')
    score_guest_player2 = data.get('score_guest_player2', None)  
    result = data.get('result')
    match = Match.objects.create(
        player_id=player_id,
        guest_player1=guest_player1,
        guest_player2=guest_player2,
        score_player=score_player,
        score_guest_player1=score_guest_player1,
        score_guest_player2=score_guest_player2,
        result=result
    )
    return JsonResponse({'message': 'Match created successfully', 'match_id': match.id}, status=201)

@require_http_methods(["GET"])
def list_matches(request):
    matches = Match.objects.filter(is_deleted=False).values()
    return JsonResponse(list(matches), safe=False)
