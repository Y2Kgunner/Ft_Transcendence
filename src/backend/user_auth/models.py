from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid
from django.contrib.auth import get_user_model
#OTP
import pyotp
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_static.models import StaticDevice
from django_otp.plugins.otp_email.models import EmailDevice


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
    # basic info
    username = models.CharField(_('username'), max_length=20, unique=True)
    email = models.EmailField(_('email address'), max_length=50, unique=True)
    # additional info
    first_name = models.CharField(_('first name'), max_length=20, blank=True)
    last_name = models.CharField(_('last name'), max_length=20, blank=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message=_("Phone number must be entered in the format: '+971-XX-XXX-XXXX'. Up to 15 digits allowed."))
    # phone_number = models.CharField(_('phone number'), validators=[phone_regex], max_length=17, blank=True)
    phone_number = models.CharField(_('phone number'), validators=[phone_regex], max_length=17, blank=True, null=True)
    address = models.CharField(_('address'), max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    # permissions
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    # other 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    GDPR_agreement = models.BooleanField(default=False)
    GDPR_agreement_date = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    # auth
    google_auth = models.BooleanField(default=False)
    intra_auth = models.BooleanField(default=False)
    github_auth = models.BooleanField(default=False)
    # 2FA
    twofa_enabled = models.BooleanField(default=False)
    twofa_secret = models.CharField(max_length=255, blank=True, null=True)


    objects = WebUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.username

    def enable_totp(self):
        existing_device = TOTPDevice.objects.filter(user=self, confirmed=True).first()
        if not existing_device:
            totp_device = TOTPDevice(user=self, name="default", confirmed=False)
            totp_device.save()
        self.twofa_enabled = True
        self.save()

    def disable_totp(self):
        """Disable TOTP for the user."""
        TOTPDevice.objects.filter(user=self).delete()
        self.twofa_enabled = False
        self.save()

    def anonymize_user(self):
        unique_suffix = uuid.uuid4().hex[:8] 
        self.username = f'anonymous_{unique_suffix}'
        self.email = f'anonymous_{unique_suffix}@example.com'
        self.first_name = ''
        self.last_name = ''
        self.phone_number = None
        self.address = ''
        self.profile_picture = None
        self.save()


class UserOTP(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='otp_codes')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']