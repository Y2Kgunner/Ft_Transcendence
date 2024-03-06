from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model
from tournament.models import Participant, Tournament
import json
from tournament.views.sanitize import validate_and_sanitize_username

User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def create_tournament(request):
    tournament = None 
    try:
        if Tournament.objects.filter(creator=request.user, is_active=True , is_completed= False).exists():
            return JsonResponse({"error": "You already have an active tournament. Please complete it before creating a new one."}, status=400)
        
        data = json.loads(request.body)
        tournament = Tournament.objects.create(
            creator=request.user,
            is_active=True,
        )
        participants_data = data.get("participants", [])
        for participant in participants_data:
            user = None
            temp_username = None
            if "user_id" in participant:
                user = User.objects.filter(id=participant["user_id"]).first()
            elif "temp_username" in participant:
                temp_username = participant["temp_username"]
            
            Participant.objects.create(
                tournament=tournament,
                user=user,
                temp_username=temp_username
            )
        return JsonResponse({"message": "Tournament created successfully.", "tournament_id": tournament.id}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    except Exception as e:
        if tournament:
            tournament.delete()
        return JsonResponse({"error": str(e)}, status=400)
