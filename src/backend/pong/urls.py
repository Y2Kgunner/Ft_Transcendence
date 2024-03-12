from django.urls import path, include
from pong.views import views


urlpatterns = [
    path('create/', views.create_match, name='create_match'),
    path('delete/', views.delete_match, name='delete_match'),
    path('list/', views.list_matches, name='list_matches'),
]