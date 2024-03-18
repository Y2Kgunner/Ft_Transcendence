from django.db import models
from user_auth.models import WebUser

class Match(models.Model):
    player = models.ForeignKey(WebUser, related_name='matches', on_delete=models.CASCADE, null=True, blank=True)
    guest_player1 = models.CharField(max_length=20)
    guest_player2 = models.CharField(max_length=20, blank=True, null=True)  
    match_date = models.DateTimeField(auto_now_add=True)
    score_player = models.IntegerField(default=0)
    score_guest_player1 = models.IntegerField(default=0)
    score_guest_player2 = models.IntegerField(default=0, null=True, blank=True) 
    winner = models.CharField(max_length=10, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Match {self.id} on {self.match_date}"

class GuestGameStats(models.Model):
    guest_name = models.CharField(max_length=255)
    games_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    scored = models.IntegerField(default=0)

def update_player_stats(winner_name, player_id, match):
    player = WebUser.objects.get(id=player_id)
    player.pong_games_played += 1
    player.pong_scored += match.score_player
    if player.username == winner_name:
        player.pong_wins += 1
    else:
        player.pong_losses += 1
    player.save()


def update_guest_stats(winner_name, guest_name, match):
    guest, created = GuestGameStats.objects.get_or_create(guest_name=guest_name)
    guest.games_played += 1
    if winner_name == guest_name:
        guest.wins += 1
    else:
        guest.losses += 1
    guest.scored += match.score_guest_player1 if match.guest_player1 == guest_name else match.score_guest_player2 or 0
    guest.save()
