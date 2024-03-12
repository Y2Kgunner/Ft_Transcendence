from django.utils.timezone import now
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pong.models import Match
import json

@csrf_exempt
@require_http_methods(["POST"])
def finish_and_update_match(request):
    try:
        data = json.loads(request.body)
        match_id = data['match_id']
        match = Match.objects.get(id=match_id, is_deleted=False)  
        match.end_time = now()
        match.score_logged_in_user = data.get('score_logged_in_user', match.score_logged_in_user)
        match.score_guest_player1 = data.get('score_guest_player1', match.score_guest_player1)
        match.score_guest_player2 = data.get('score_guest_player2', match.score_guest_player2)
        match.save()
        return JsonResponse({"message": "Match finished successfully", "match_id": match.id})
    except Match.DoesNotExist:
        return JsonResponse({"error": "Match not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
