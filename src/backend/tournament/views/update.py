from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from tournament.models import Tournament, Match, Participant
from django.db.models import Max

@csrf_exempt
@require_http_methods(["POST"])
def update_match_result(request, match_id):
    try:
        data = json.loads(request.body)
        winner_id = data.get('winner_id')

        match = Match.objects.get(id=match_id, is_completed=False)
        winner = Participant.objects.get(id=winner_id, tournament=match.tournament)

        if not match.participant_one or (not match.participant_two and not match.is_bye):
            return JsonResponse({"error": "Invalid match configuration. Both participants are required unless it's a bye match."}, status=400)

        match.is_completed = True
        match.winner = winner
        match.save()

        tournament = match.tournament
        current_round = match.round_number

        if Match.objects.filter(tournament=tournament, round_number=current_round, is_completed=False).exists():
            return JsonResponse({"message": "Current round still in progress."}, status=200)
        
        next_round = current_round + 1
        next_round_matches_exist = Match.objects.filter(tournament=tournament, round_number=next_round).exists()

        if not next_round_matches_exist:
            if not arrange_next_round_matches(tournament.id, current_round):
                tournament.is_completed = True
                winner_info = determine_tournament_winner(tournament.id)
                if tournament.is_completed:
                    tournament.save()
                    return JsonResponse({
                        "message": "Tournament completed, winner declared.",
                        "winner": winner_info if winner_info else "Winner information unavailable"
                    }, status=200)
            else:
                return JsonResponse({"message": "Next round matches arranged successfully."}, status=200)
        return JsonResponse({"message": "Proceeding to the next round."}, status=200)
    except Match.DoesNotExist:
        return JsonResponse({"error": "Match not found."}, status=404)
    except Participant.DoesNotExist:
        return JsonResponse({"error": "Winner participant not found."}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


def arrange_next_round_matches(tournament_id, last_round_number):
    last_round_matches = Match.objects.filter(
        tournament_id=tournament_id, 
        round_number=last_round_number, 
        winner__isnull=False
    )
    winner_ids = last_round_matches.values_list('winner', flat=True)
    
    new_round_number = last_round_number + 1
    match_order = 1
    next_round_matches_info = []

    winners = list(Participant.objects.filter(id__in=winner_ids))

    if len(winners) % 2 != 0:
        bye_participant = winners.pop()
        record_bye_match(tournament_id, bye_participant, new_round_number, match_order)
        match_order += 1

    for i in range(0, len(winners), 2):
        p1, p2 = winners[i], winners[i + 1]
        new_match = Match.objects.create(
            tournament_id=tournament_id,
            participant_one=p1,
            participant_two=p2,
            match_order=match_order,
            round_number=new_round_number,
            is_bye=False
        )
        next_round_matches_info.append(format_match_info(new_match))
        match_order += 1

    return next_round_matches_info

def record_bye_match(tournament_id, bye_participant, new_round_number, match_order):
    Match.objects.create(
        tournament_id=tournament_id,
        participant_one=bye_participant,
        participant_two=None,  
        match_order=match_order,
        round_number=new_round_number,
        is_bye=True,
        is_completed=True,  
        winner=bye_participant
    )

def format_match_info(match):
    return {
        "match_id": match.id,
        "round_number": match.round_number,
        "match_order": match.match_order,
        "participant_one_id": match.participant_one.id,
        "participant_two_id": match.participant_two.id if match.participant_two else None,
        "is_bye": match.is_bye
    }


def check_and_proceed_tournament(tournament_id, current_round):
    if Match.objects.filter(tournament_id=tournament_id, round_number=current_round, is_completed=False).exists():
        return JsonResponse({"message": "Waiting for other matches in the round to complete."}, status=200)

    next_round_exists = Match.objects.filter(tournament_id=tournament_id, round_number=current_round + 1).exists()
    if not next_round_exists:
        next_round_matches_info = arrange_next_round_matches(tournament_id, current_round)
        if next_round_matches_info:
            return JsonResponse({"message": "Next round matches arranged successfully.", "next_round_matches": next_round_matches_info}, status=200)
        else:
            tournament = Tournament.objects.get(id=tournament_id)
            tournament.is_completed = True
            tournament.save()
            return JsonResponse({"message": "Tournament completed!"}, status=200)
    else:
        return JsonResponse({"message": "Proceeding to the next round."}, status=200)
    
def determine_tournament_winner(tournament_id):
    final_match = Match.objects.filter(tournament_id=tournament_id, is_completed=True).order_by('-round_number', '-match_order').first()
    if final_match and final_match.winner and not final_match.winner.is_bye:
        winner_data = {
            "id": final_match.winner.id,
            "username": final_match.winner.user.username if final_match.winner.user else final_match.winner.temp_username
        }
        return winner_data
    return None
