from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Min
from tournament.models import Tournament, Match, Participant

@csrf_exempt
@require_http_methods(["GET"])
def get_next_match(request, tournament_id=None):
    try:
        # Fetch the tournament either by ID or the first active tournament for the user
        if tournament_id:
            tournament = Tournament.objects.get(id=tournament_id, is_active=True, is_completed=False)
        else:
            tournament = Tournament.objects.filter(creator=request.user, is_active=True).first()
            if not tournament:
                return JsonResponse({"message": "No active tournament found."}, status=404)

        # Fetch the next incomplete match across any round
        next_match = tournament.matches.filter(is_completed=False).order_by('round_number', 'match_order').first()
        
        if next_match:
            response_data = {
                "match_id": next_match.id,
                "participant_one": next_match.participant_one.id if next_match.participant_one else None,
                "participant_two": next_match.participant_two.id if next_match.participant_two else None,
                "round_number": next_match.round_number,
            }
            return JsonResponse({"next_match": response_data}, status=200)
        else:
            return JsonResponse({"message": "No more matches left or tournament has not started."}, status=404)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "Tournament not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
