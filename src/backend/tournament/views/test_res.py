from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from tournament.models import Match, Participant
import json

@csrf_exempt
def submit_match_result_by_details(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            tournament_id = data.get('tournament_id')
            match_order = data.get('match_order')
            round_number = data.get('round_number')
            winner_participant_id = data.get('winner_participant_id')
            match = Match.objects.get(
                tournament_id=tournament_id, 
                match_order=match_order, 
                round_number=round_number
            )
            match.winner_id = winner_participant_id
            match.is_completed = True
            match.result = f"Winner: {winner_participant_id}"
            match.save()
            return JsonResponse({"message": "Match result updated successfully"}, status=200)
        except Match.DoesNotExist:
            return JsonResponse({"error": "Match not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)