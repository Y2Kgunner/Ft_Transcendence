from django.db import transaction
import random
from django.db import models
from django.conf import settings

class Tournament(models.Model):
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tournaments')
    is_active = models.BooleanField(default=True)
    is_started = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_tournaments')
    
    def remaining_matches_count(self):
        existing_incomplete_matches = self.matches.filter(is_completed=False).count()
        curr_participants = self.participants.count()
        total_matches = 0
        while curr_participants > 1:
            if curr_participants % 2 != 0:
                curr_participants += 1
            matches_this_round = curr_participants // 2
            total_matches += matches_this_round
            curr_participants = matches_this_round
        arranged_matches = self.matches.count()
        remaining_matches = max(0, total_matches - arranged_matches)
        return existing_incomplete_matches + remaining_matches
    
    def __str__(self):
        creator_name = self.creator.username if self.creator else "Unknown"
        return f"Tournament by {creator_name}"

class Participant(models.Model):
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='participations')
    temp_username = models.CharField(max_length=255, null=True, blank=True)
    is_bye = models.BooleanField(default=False, help_text='Indicates if the participant is a placeholder for a bye.')

    class Meta:
        unique_together = ('tournament', 'user', 'temp_username')

    def __str__(self):
        if self.is_bye:
            return "Bye"
        return self.user.username if self.user else self.temp_username


class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    # participant_one = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='matches_as_participant_one')
    # participant_two = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='matches_as_participant_two')
    participant_one = models.ForeignKey('Participant', on_delete=models.CASCADE, related_name='matches_as_participant_one')
    participant_two = models.ForeignKey('Participant', on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_as_participant_two')
    match_order = models.IntegerField(default=0)
    result = models.CharField(max_length=255, blank=True, null=True)
    winner = models.ForeignKey(Participant, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')
    loser = models.ForeignKey(Participant, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_lost')
    is_completed = models.BooleanField(default=False)
    round_number = models.IntegerField(default=1)
    is_bye = models.BooleanField(default=False, help_text="Indicates if the match is a bye.")

    def __str__(self):
        participants = f"{self.participant_one} vs {self.participant_two}"
        return f"Match: {participants} - Winner: {self.winner}" if self.winner else participants

    class Meta:
        ordering = ['match_order']


def arrange_tournament_matches(tournament_id):
    # print("arranging matches for tournament")
    with transaction.atomic():
        participants = Participant.objects.filter(tournament_id=tournament_id).order_by('?')
        participants_list = list(participants)

        match_order = 1
        round_number = 1
        match_details = [] 

        while len(participants_list) > 1: 
            p1 = participants_list.pop(0)
            p2 = participants_list.pop(0)

            match = Match.objects.create(
                tournament_id=tournament_id, 
                participant_one=p1, 
                participant_two=p2, 
                match_order=match_order,
                round_number=round_number,
                is_bye=False
            )
            match_order += 1
            match_details.append(format_match_info(match))
        if participants_list:
            bye_participant = participants_list.pop()
            bye_match = Match.objects.create(
                tournament_id=tournament_id,
                participant_one=bye_participant,
                participant_two=bye_participant, 
                match_order=match_order,
                round_number=round_number,
                is_completed=True,
                winner=bye_participant, 
                is_bye=True
            )
            match_details.append(format_match_info(bye_match))
            # print_match_details(tournament_id, round_number, match_order, bye_participant, bye=True)
    return match_details

def format_match_info(match):
    return {
        "match_id": match.id,
        "round_number": match.round_number,
        "match_order": match.match_order,
        "participant_one_id": match.participant_one.id,
        "participant_two_id": match.participant_two.id if match.participant_two else None,
        "is_bye": match.is_bye
    }

# def print_match_details(tournament_id, round_number, match_order, participant_one, participant_two=None, bye=False):
#     if bye:
#         print(f"Round {round_number}: Participant {participant_one} receives a bye.")
#     else:
#         print(f"Round {round_number} - Match {match_order}: {participant_one} vs {participant_two}")

