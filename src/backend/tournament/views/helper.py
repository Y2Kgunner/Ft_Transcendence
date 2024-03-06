from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from tournament.models import Tournament, arrange_tournament_matches
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@require_http_methods(["POST"])
def start_tournament(request):
    try:
        tournament = Tournament.objects.filter(creator=request.user, is_active=True).first()

        if not tournament:
            return JsonResponse({"message": "No active tournament found for this user."}, status=404)

        if tournament.is_started or tournament.is_completed:
            return JsonResponse({"error": "Tournament cannot be started again."}, status=400)
        
        tournament.is_started = True
        tournament.save()
        tournament_id = tournament.id
        arrange_tournament_matches(tournament_id)

        return JsonResponse({"message": "Tournament started successfully."}, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "Tournament not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def arrange_matches(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id, creator=request.user)
        # make sure the tournament is started but not completed and matches are not already arranged
        if tournament.is_completed or tournament.matches.exists():
            return JsonResponse({"error": "Matches cannot be arranged at this stage."}, status=400)
        match_details = arrange_tournament_matches(tournament_id)
        print("from the view ")
        print("match_details returned to view:", match_details)  # Debug output
        return JsonResponse({"message": "Matches arranged successfully.","match_details": match_details}, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "Tournament not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def complete_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        
        if tournament.is_completed:
            return JsonResponse({"error": "Tournament is already completed."}, status=400)
        
        tournament.is_completed = True
        tournament.is_active = False
        tournament.is_started = False
        tournament.save()

        return JsonResponse({"message": "Tournament completed successfully."}, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "Tournament not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    

