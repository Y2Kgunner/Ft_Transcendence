import jwt
from django.conf import settings
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model

class JWTHandler:
    @staticmethod
    def generate_jwt(user):
        """
        Generate a JWT token for a user.
        """
        expiration_time = datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_DELTA.total_seconds())
        payload = {
            'user_id': user.id,
            'username': user.username,
            'exp': expiration_time.timestamp()
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return token

    @staticmethod
    def decode_jwt(token):
        """
        Decode a JWT token and return its payload.
        """
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"require": ["exp"]})
            return payload
        except jwt.ExpiredSignatureError:
            return {'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}
    
    @staticmethod
    def get_user_from_token(token):
        """
        Retrieve the user from the JWT token, if valid.
        """
        payload = JWTHandler.decode_jwt(token)
        if 'error' not in payload:
            try:
                user = get_user_model().objects.get(id=payload['user_id'])
                return user
            except get_user_model().DoesNotExist:
                return None
        return None
