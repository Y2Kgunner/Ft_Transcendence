from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from tournament.models import Tournament
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def get_active_tournament_for_user(request):
    tournament = Tournament.objects.filter(creator=request.user, is_active=True).first()

    if not tournament:
        return JsonResponse({"message": "No active tournament found for this user."}, status=404)

    participants_data = []
    for participant in tournament.participants.all():
        if participant.user:
            participants_data.append({
                "id": participant.user.id,
                "username": participant.user.username, 
            })
        else:
            participants_data.append({
                "id": participant.id,
                "username": participant.temp_username,
            })

    tournament_data = {
        "id": tournament.id,
        "creator": {
            "user_id": tournament.creator.id,
            "username": tournament.creator.username,
        },
        "participants": participants_data,
        "is_active": tournament.is_active,
        "is_completed": tournament.is_completed,
        "is_started": tournament.is_started,
        "created_at": tournament.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    }
    return JsonResponse(tournament_data)
