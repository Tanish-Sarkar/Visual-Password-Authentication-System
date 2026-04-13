import os
import bcrypt
import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from argon2 import PasswordHasher
from dotenv import load_dotenv

# Load environment variables with absolute path to ensure consistency
base_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_dir, '.env')
load_dotenv(env_path)

# Setup Argon2 hasher using environment config
ph = PasswordHasher(
    time_cost=int(os.getenv('ARGON2_TIME_COST', 2)),
    memory_cost=int(os.getenv('ARGON2_MEMORY_COST', 65536)),
    parallelism=int(os.getenv('ARGON2_PARALLELISM', 2))
)

SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_secret')
print(f"DEBUG: SECRET_KEY loading in utils.py. Length: {len(SECRET_KEY)}")


# --- Hashing Utilities ---

def hash_pin(pin_string: str) -> str:
    """Hashes a 4-digit PIN using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pin_string.encode('utf-8'), salt).decode('utf-8')

def verify_pin(pin_string: str, hashed_pin: str) -> bool:
    """Verifies a PIN against its hash."""
    return bcrypt.checkpw(pin_string.encode('utf-8'), hashed_pin.encode('utf-8'))

def hash_gesture_sequence(gesture_string: str) -> str:
    """Hashes a gesture sequence string using Argon2."""
    return ph.hash(gesture_string)

def verify_gesture_sequence(gesture_string: str, hashed_gesture: str) -> bool:
    """Verifies a gesture sequence against its Argon2 hash."""
    try:
        return ph.verify(hashed_gesture, gesture_string)
    except Exception:
        # Argon2 verify throws an exception if the verification fails.
        return False


# --- JWT Utilities ---

def generate_jwt(user_id: int, username: str) -> str:
    """Generates a JWT token valid for 24 hours."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id),
        'username': username
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_jwt(token: str):
    """Decodes a JWT token. Returns payload or an error string."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: JWT Error - Expired token")
        return "Expired token."
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: JWT Error - Invalid token error: {str(e)}")
        # Log if the secret key might be the issue (e.g. key used for signature is not the one we have)
        return "Invalid token."
    except Exception as e:
        print(f"DEBUG: JWT Error - General: {str(e)}")
        return str(e)


# --- Decorators ---

def token_required(f):
    """Decorator to require a valid JWT via the Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Format expected: Authorization: Bearer <token>
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing!'}), 401
            
        data = decode_jwt(token)
        if isinstance(data, str): # Error means it returned string
            return jsonify({'success': False, 'message': data}), 401
            
        # Add the decoded user data to the route
        return f(current_user=data, *args, **kwargs)
        
    return decorated
