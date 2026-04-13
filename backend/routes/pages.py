from flask import Blueprint, jsonify
from utils import token_required

pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/welcome', methods=['GET'])
@token_required
def welcome(current_user):
    """The final route that only authenticated users can access."""
    # Return user-specific dummy sensitive payload to demonstrate standard protected capability
    payload = {
        'success': True,
        'message': f"Welcome to the Visual Password Authentication System, {current_user['username']}!",
        'data': {
            'dashboard_info': 'This is top secret data meant only for authenticated users.',
            'auth_timestamp': current_user.get('iat')
        }
    }
    return jsonify(payload), 200
