import re

def validate_and_sanitize_username(username):
    """
    Validates and sanitizes a username.

    - Strips whitespace.
    - Checks for allowed characters (alphanumeric, underscores, and dashes).
    - Ensures the username is within the required length.
    - Converts the username to lowercase for normalization.

    Parameters:
    - username (str): The username to validate and sanitize.

    Returns:
    - str: The sanitized username.

    Raises:
    - ValueError: If the username is invalid.
    """
    sanitized_username = username.strip()

    if not re.match(r'^[\w-]+$', sanitized_username):
        print(sanitized_username)
        raise ValueError("Username contains invalid characters. Only alphanumeric characters, underscores, and dashes are allowed.")

    if not (3 <= len(sanitized_username) <= 20):
        raise ValueError("Username must be between 3 and 20 characters long.")

    sanitized_username = sanitized_username.lower()
    return sanitized_username
