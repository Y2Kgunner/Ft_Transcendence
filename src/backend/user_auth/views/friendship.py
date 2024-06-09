from django.core.mail import EmailMessage
from django.conf import settings
import smtplib
import ssl
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from ..models import WebUser, Friendship
from django.db import models
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone


@csrf_exempt
@require_http_methods(["POST"])
def add_friend(request, user_id):
    user = request.user
    if Friendship.objects.filter((models.Q(creator=user, friend_id=user_id) | models.Q(creator_id=user_id, friend=user)), status='accepted').exists():
        return JsonResponse({"message": "You are already friends."}, status=400)
    if Friendship.objects.filter((models.Q(creator=user, friend_id=user_id) | models.Q(creator_id=user_id, friend=user)), status='pending').exists():
        return JsonResponse({"message": "Friend request already sent."}, status=400)
    if Friendship.objects.filter(creator=user, created_at__date=timezone.now().date()).count() >= 5:
        return JsonResponse({"message": "You have reached the maximum number of friend requests for today."}, status=400)
    try:
        friend = WebUser.objects.get(pk=user_id)
        if user != friend:
            Friendship.objects.get_or_create(creator=user, friend=friend)
            send_friendship_request_email(friend, user)
            return JsonResponse({"message": "Friend request sent."}, status=201)
        else:
            return JsonResponse({"message": "You cannot add yourself as a friend."}, status=400)
    except WebUser.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

@csrf_exempt
@require_http_methods(["DELETE"])
def remove_friend(request, user_id):
    user = request.user
    try:
        friend = WebUser.objects.get(pk=user_id)
        Friendship.objects.filter((models.Q(creator=user, friend=friend) | models.Q(creator=friend, friend=user)), accepted=True).delete()
        return JsonResponse({"message": "Friend removed."}, status=204)
    except WebUser.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

def list_friends(request):
    user = request.user
    friendships = Friendship.objects.filter(
        (models.Q(creator=user) | models.Q(friend=user)),
        status='accepted'
    ).prefetch_related('creator', 'friend')

    friends_info = [{
        'username': f.friend.username if f.creator == user else f.creator.username,
        'online_status': f.friend.is_online() if f.creator == user else f.creator.is_online(),
        'last_activity': f.friend.last_seen.strftime('%Y-%m-%d %H:%M:%S') if f.creator == user else f.creator.last_seen.strftime('%Y-%m-%d %H:%M:%S'),
        'games_played': f.friend.pong_games_played if f.creator == user else f.creator.pong_games_played, 
        'wins' : f.friend.pong_wins if f.creator == user else f.creator.pong_wins,
        'losses' : f.friend.pong_losses if f.creator == user else f.creator.pong_losses
        } for f in friendships]

    return JsonResponse({'friends': friends_info}, safe=False)


@csrf_exempt
@require_http_methods(["POST"])
def accept_friend_request(request, user_id):
    try:
        friendship = Friendship.objects.get(creator_id=user_id, friend=request.user, status='pending')
        friendship.status = 'accepted'
        friendship.save()
        return JsonResponse({"message": "Friend request accepted."}, status=200)
    except Friendship.DoesNotExist:
        return JsonResponse({"error": "Friend request not found."}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def reject_friend_request(request, user_id):
    user = request.user
    try:
        friendship = Friendship.objects.get(creator_id=user_id, friend=user, status=Friendship.PENDING)
        friendship.status = Friendship.REJECTED
        friendship.save()
        return JsonResponse({"message": "Friend request rejected."}, status=200)
    except Friendship.DoesNotExist:
        return JsonResponse({"error": "Friend request not found."}, status=404)

@csrf_exempt
@require_http_methods(["GET"])
def list_friend_requests(request):
    user = request.user
    pending_requests = Friendship.objects.filter(friend=user, status=Friendship.PENDING)
    requests = [{"from": request.creator.username,"created_at": request.created_at} for request in pending_requests]
    return JsonResponse({"requests": requests}, status=200)

@csrf_exempt
@require_http_methods(["GET"])
def check_username(request, username):
    try:
        user = WebUser.objects.get(username=username)
        if user == request.user:
            return JsonResponse({"message": "You cannot add yourself as a friend."}, status=400)
        if Friendship.objects.filter((models.Q(creator=request.user, friend=user) | models.Q(creator=user, friend=request.user)), status='accepted').exists():
            return JsonResponse({"message": "You are already friends."}, status=200)
        return JsonResponse({
            "message": "User exists.",
            "user_info": {
                "username": user.username,
                "user_id": user.id,
                "profile_picture_url": user.profile_picture.url if user.profile_picture else None }}, status=200)
    except WebUser.DoesNotExist:
        return JsonResponse({"message": "User not found."}, status=404)

@require_http_methods(["GET"])
def pending_frinship_requets(request):
    user = request.user
    pending_requests = Friendship.objects.filter(friend=user, status='pending')
    notifications = []
    for req in pending_requests:
        notification = {
            "username": f"{req.creator.username}",
            "id": req.creator.id
        }
        notifications.append(notification)

    return JsonResponse({"notifications": notifications}, status=200)


def send_friendship_request_email(friend, user):
    subject = "Friendship Request"
    body = f"Hi {friend.username}, you have a new friend request from {user.username}."
    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=settings.EMAIL_HOST_USER,
        to=[friend.email]
    )
    email.send()
