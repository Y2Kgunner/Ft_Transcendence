from django import forms
from user_auth.models import WebUser

class ProfilePictureForm(forms.ModelForm):
    class Meta:
        model = WebUser
        fields = ['profile_picture']  
