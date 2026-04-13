from flask import Blueprint, request, jsonify
from utils import hash_pin, hash_gesture_sequence, verify_pin, verify_gesture_sequence, generate_jwt, decode_jwt, token_required
from database import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/check-registration', methods=['GET'])
def check_registration():
    """Verifies if a username exists before allowing a user to proceed to Login or Sign-up."""
    username = request.args.get('username')
    if not username:
        return jsonify({'success': False, 'message': 'Username parameter is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    is_registered = user is not None
    return jsonify({'success': True, 'isRegistered': is_registered}), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Creates the user and stores both hashed credentials in a single transaction."""
    data = request.get_json()
    username = data.get('username')
    display_name = data.get('display_name')
    gesture_sequence = data.get('gesture_sequence')
    pin = data.get('pin')

    if not all([username, display_name, gesture_sequence, pin]):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    try:
        # Hash passwords
        gesture_hash = hash_gesture_sequence(gesture_sequence)
        pin_hash = hash_pin(str(pin))

        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if already exists (again, as fallback safeguard)
        cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Username already exists'}), 409

        # Insert novel user
        cur.execute(
            """INSERT INTO users (username, display_name, gesture_hash, pin_hash) 
               VALUES (%s, %s, %s, %s) RETURNING id;""",
            (username, display_name, gesture_hash, pin_hash)
        )
        # new_user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'success': True, 'message': 'User registered successfully'}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Handles both Gesture and PIN verification."""
    data = request.get_json()
    username = data.get('username')
    auth_method = data.get('auth_method') # expected 'gesture' or 'pin'

    if not all([username, auth_method]):
        return jsonify({'success': False, 'message': 'Username and auth_method are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, username, display_name, gesture_hash, pin_hash FROM users WHERE username = %s;", (username,))
    user = cur.fetchone()

    # User not found
    if not user:
        cur.close()
        conn.close()
        return jsonify({'success': False, 'message': 'Invalid username or credentials'}), 401

    user_id, retrieved_username, display_name, gesture_hash, pin_hash = user
    is_authenticated = False

    try:
        if auth_method == 'gesture':
            gesture_sequence = data.get('gesture_sequence')
            if not gesture_sequence:
                raise ValueError("gesture_sequence missing")
            is_authenticated = verify_gesture_sequence(gesture_sequence, gesture_hash)

        elif auth_method == 'pin':
            pin = data.get('pin')
            if not pin:
                raise ValueError("pin missing")
            is_authenticated = verify_pin(str(pin), pin_hash)

        else:
            raise ValueError("Invalid auth_method. Must be 'gesture' or 'pin'")

    except Exception as e:
        # If there's an error with payload
        status = 'failure'
        cur.execute(
            "INSERT INTO auth_logs (user_id, auth_method, status) VALUES (%s, %s, %s);",
            (user_id, auth_method if auth_method in ['gesture', 'pin'] else 'invalid', status)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'message': f"Authentication error: {str(e)}"}), 400

    # Log the attempt
    status = 'success' if is_authenticated else 'failure'
    cur.execute(
        "INSERT INTO auth_logs (user_id, auth_method, status) VALUES (%s, %s, %s);",
        (user_id, auth_method, status)
    )
    conn.commit()
    cur.close()
    conn.close()

    if is_authenticated:
        token = generate_jwt(user_id, retrieved_username)
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'username': retrieved_username,
                'display_name': display_name
            }
        }), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@auth_bp.route('/verify-session', methods=['GET'])
@token_required
def verify_session(current_user):
    """Verifies validity of the token parsed cleanly by token_required."""
    return jsonify({'success': True, 'isValid': True, 'user': current_user}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Invalidate the session on the client side handling."""
    # Since JWT is stateless, logout natively relies on client-side token deletion.
    # We provide this for uniform API structure.
    return jsonify({'success': True, 'message': 'Logged out successfully.'}), 200
