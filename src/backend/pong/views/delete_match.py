from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pong.models import Match
from datetime import datetime
import json

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