from django.db import models
from user_auth.models import WebUser

class Match(models.Model):
    player = models.ForeignKey(WebUser, related_name='matches', on_delete=models.CASCADE)
    guest_player1 = models.CharField(max_length=20, blank=True, null=True)  
    guest_player2 = models.CharField(max_length=20, blank=True, null=True)  
    match_date = models.DateTimeField(auto_now_add=True)
    score_player = models.IntegerField(default=0)
    score_guest_player1 = models.IntegerField(default=0)
    score_guest_player2 = models.IntegerField(default=0, null=True, blank=True) #optional as there can be only 2 players
    result = models.CharField(max_length=10)  # "Win" or "Lose" - case senstive 
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Match {self.id} on {self.match_date}"
