from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta


class WebUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not username:
            raise ValueError(_('The Username field must be set'))

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(username, email, password, **extra_fields)
            
    def validate_username(self, username):
        if not username:
            raise ValueError(_('The Username field must be set'))
        if len(username) < 3 or len(username) > 20:
            raise ValueError(_('Username must be between 3 and 20 characters long.'))
        if not username.isalnum():
            raise ValueError(_('Username must be alphanumeric.'))
        if self.filter(username=username).exists():
            raise ValueError(_('Username already exists.'))
        return username
    
    def validate_email(self, email):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if self.filter(email=email).exists():
            raise ValueError(_('Email already exists.'))
        if len(email) > 50 or len(email) < 5:
            raise ValueError(_('Email must be between 5 and 50 characters long.'))
        if '@' not in email:
            raise ValueError(_('Email must be valid.'))
        return email
        
    
class CustomPermissionsMixin(PermissionsMixin):
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)s",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)s",
    )

class WebUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(_('username'), max_length=20, unique=True)
    email = models.EmailField(_('email address'), max_length=50, unique=True)
    first_name = models.CharField(_('first name'), max_length=20, blank=True)
    last_name = models.CharField(_('last name'), max_length=20, blank=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message=_("Phone number must be entered in the format: '+971-XX-XXX-XXXX'."))
    phone_number = models.CharField(_('phone number'), validators=[phone_regex], max_length=17, blank=True, null=True)
    address = models.CharField(_('address'), max_length=100, blank=True)
    # profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    GDPR_agreement = models.BooleanField(default=False)
    GDPR_agreement_date = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    intra_auth = models.BooleanField(default=False)
    twofa_enabled = models.BooleanField(default=False)
    twofa_secret = models.CharField(max_length=255, blank=True, null=True)
    pong_games_played = models.IntegerField(default=0)
    pong_wins = models.IntegerField(default=0)
    pong_losses = models.IntegerField(default=0)
    pong_scored = models.IntegerField(default=0)
    last_seen = models.DateTimeField(default=timezone.now)

    objects = WebUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.username

    def anonymize_user(self):
        unique_suffix = uuid.uuid4().hex[:8] 
        self.username = f'anonymous_{unique_suffix}'
        self.first_name = ''
        self.last_name = ''
        self.phone_number = None
        self.address = ''
        self.profile_picture = None
        self.save()
    
    def is_online(self):
        return timezone.now() - self.last_seen < timedelta(minutes=5)


class Friendship(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    STATUS_CHOICES = [(PENDING, 'Pending'),(ACCEPTED, 'Accepted'),(REJECTED, 'Rejected'),]
    creator = models.ForeignKey(WebUser, on_delete=models.CASCADE, related_name="friendships_started")
    friend = models.ForeignKey(WebUser, on_delete=models.CASCADE, related_name="friendships_received")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)

    class Meta:
        unique_together = ('creator', 'friend')

    def __str__(self):
        return f"{self.creator.username} - {self.friend.username} ({self.status})"

    def get_friends(self):
        friendships = Friendship.objects.filter(
            models.Q(creator=self, accepted=True) | models.Q(friend=self, accepted=True)
        )
        friends = set()
        for friendship in friendships:
            if friendship.creator == self:
                friends.add(friendship.friend)
            else:
                friends.add(friendship.creator)
        return friends

    def __str__(self):
        return self.username