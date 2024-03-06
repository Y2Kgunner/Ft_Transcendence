from django.urls import path, include
from .views.__init__ import *


urlpatterns = [
    path('test', test_api),
    path('register', register),
    path('login', login),
    path('finalize_login', finalize_login),
    path('verify_otp', verify_otp),
    path('password_reset', password_reset),
    path('logout', logout),
    path('enable_2fa', enable_2fa_api),
    path('disable_2fa', disable_2fa_api),
    path('send_otp_email', send_otp_email_api),
    path('verify_otp', verify_otp_api),
    path('profile', UserProfileView.as_view(),name='profile'),
    path('fortytwo', fortytwo),
    path('oauth_callback', oauth_callback, name='oauth_callback'),
    path('set_password/<int:user_id>/', set_password, name='set_password'),
    path('anonymize', anonymize_user_data),
    path('init_delete', initiate_delete_account),
    path('delete_account', delete_user_account),
    path('auth_status', check_auth_status, name='check_auth_status'),
]
