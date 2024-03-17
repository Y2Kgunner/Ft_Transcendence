from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pong.models import Match
from datetime import datetime
import json
from user_auth.models import WebUser


#be careful with this one because it will delete the match from the database permanently
@csrf_exempt
@require_http_methods(["POST"])
def delete_match(request):
    try:
        data = json.loads(request.body)
        match_id = data['match_id']
        match = Match.objects.get(id=match_id)
        match.is_deleted = True
        match.deleted_at = datetime.now()
        match.save()
        return JsonResponse({"message": "Match deleted successfully"})
    except Match.DoesNotExist:
        return JsonResponse({"error": "Match not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
@csrf_exempt
@require_http_methods(["POST"])
def delete_user_from_match(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    user_id = data.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'Missing user_id'}, status=400)
    if not WebUser.objects.filter(id=user_id).exists():
        return JsonResponse({'error': 'User not found'}, status=404)
    deleted_matchs = Match.objects.filter(player_id=user_id).update(player=None)
    return JsonResponse({'message': f'Successfully updated {deleted_matchs} matches'}, status=200)
