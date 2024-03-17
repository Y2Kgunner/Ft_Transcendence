from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from pong.models import Match
from user_auth.models import WebUser

@csrf_exempt
@require_http_methods(["POST"])
def create_match(request):
    data = json.loads(request.body)    
    player_id = data.get('player_id')
    guest_player1 = data.get('guest_player1')
    guest_player2 = data.get('guest_player2', None)  
    match = Match.objects.create(
        player_id=player_id,
        guest_player1=guest_player1,
        guest_player2=guest_player2
    )
    return JsonResponse({'message': 'Match created successfully', 'match_id': match.id}, status=201)
