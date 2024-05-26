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
    path('check_2fa_status', check_2fa_status),
    path('profile', UserProfileView.as_view(),name='profile'),
    path('fortytwo', fortytwo),
    path('oauth_callback', oauth_callback, name='oauth_callback'),
    path('set_password/<int:user_id>/', set_password, name='set_password'),
    path('anonymize', anonymize_user_data),
    path('init_delete', initiate_delete_account),
    path('initiate_delete_account', initiate_delete_account),
    path('delete_account', delete_user_account),
    path('auth_status', check_auth_status, name='check_auth_status'),
    path('get_profile_picture/', get_profile_picture, name='get_profile_picture'),
    path('upload_profile_picture/', upload_profile_picture, name='upload_profile_picture'),
    path('forgot_password_send_email',forgot_password_send_email),
    path('reset_password/<str:token>/', reset_password, name='reset_password')
    ]
