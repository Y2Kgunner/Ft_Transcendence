from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import jwt
from django.conf import settings
import logging
from user_auth.jwt_utils import JWTHandler

'''
Endpoint Description
Overview

This Django endpoint, check_auth_status, is designed to check the authentication status of a user based on a JWT (JSON Web Token) stored in cookies. It is accessible via a GET request and is exempt from CSRF (Cross-Site Request Forgery) protection, making it suitable for APIs where you might want to call this endpoint from different domains or a frontend application that's hosted separately from your backend.
Decorators

    @require_http_methods(["GET"]): This decorator restricts access to this endpoint to GET requests only, ensuring that it cannot be accessed via POST, PUT, DELETE, or any other HTTP method.
    @csrf_exempt: This decorator exempts the endpoint from CSRF token verification, allowing requests from other domains without needing a CSRF token.

Function: check_auth_status(request)

    Input Parameter: The function takes one argument, request, which represents an HTTP request.
    Process Flow:
        Token Retrieval: It first attempts to retrieve a JWT from the cookies sent with the request, using the key 'jwt'.
        No Token Handling: If no token is found in the cookies, it immediately returns a JSON response indicating that the authentication has failed ('authenticated': False) and includes an error message stating that no token was provided.
        Token Decoding: If a token is found, it tries to decode the JWT using a method decode_jwt from a custom handler JWTHandler. This step is crucial for validating the token and extracting the payload, which may include information like the user ID, issue and expiration times, etc.
        Error in Payload: If decoding the token results in an error (e.g., the token is expired or invalid), the endpoint returns a response indicating the authentication has failed, along with the specific error message.
        User Retrieval: If the token is successfully decoded, it proceeds to retrieve the user associated with this token using get_user_from_token method from JWTHandler. This typically involves looking up a user in the database whose details match those encoded in the token's payload.
        Final Authentication Check: Finally, if a user is successfully retrieved, it responds that the user is authenticated, including the username in the response. If no user is found matching the token details, it indicates a failed authentication with an appropriate error message.
'''

@require_http_methods(["GET"])
@csrf_exempt
def check_auth_status(request):
    token = request.COOKIES.get('jwt')
    if not token:
        return JsonResponse({'authenticated': False, 'error': 'No token provided'})
    payload = JWTHandler.decode_jwt(token)    
    if 'error' in payload:
        return JsonResponse({'authenticated': False, 'error': payload['error']})
    
    user = JWTHandler.get_user_from_token(token)
    if user:
        return JsonResponse({'authenticated': True, 'username': user.username})
    else:
        return JsonResponse({'authenticated': False, 'error': 'User not found'})
