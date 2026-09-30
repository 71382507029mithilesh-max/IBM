import hmac
import hashlib
import json
import base64
import time
from functools import wraps
from flask import Blueprint, request, jsonify
from models.user import User
from config.config import get_config

auth_bp = Blueprint('auth_bp', __name__)
config = get_config()

def generate_token(user_id, role, expires_in=86400):
    """Generate signed authentication token"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': int(time.time()) + expires_in
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(
        config.JWT_SECRET_KEY.encode(),
        payload_b64.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{payload_b64}.{signature}"

def decode_token(token):
    """Verify signature and return token payload"""
    try:
        payload_b64, signature = token.split('.')
        expected_sig = hmac.new(
            config.JWT_SECRET_KEY.encode(),
            payload_b64.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, signature):
            return None

        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'Authentication token missing or invalid format'}), 401
        
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Session expired or token invalid. Please log in again.'}), 401
        
        user = User.find_by_id(payload['user_id'])
        if not user:
            return jsonify({'success': False, 'message': 'User no longer exists'}), 401
            
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        if not payload or payload.get('role') != 'admin':
            return jsonify({'success': False, 'message': 'Access denied: Admin privileges required'}), 403
            
        user = User.find_by_id(payload['user_id'])
        if not user or user.get('role') != 'admin':
            return jsonify({'success': False, 'message': 'Access denied: Admin privileges required'}), 403
            
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    role = data.get('role', 'user')

    # Input validation
    if not name or not email or not phone or not password:
        return jsonify({'success': False, 'message': 'All fields (name, email, phone, password) are required.'}), 400

    if '@' not in email or '.' not in email:
        return jsonify({'success': False, 'message': 'Please provide a valid email address.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    if confirm_password and password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    # Check existing email
    existing = User.find_by_email(email)
    if existing:
        return jsonify({'success': False, 'message': 'An account with this email address already exists.'}), 409

    try:
        user = User.create(name, email, phone, password, role=role)
        token = generate_token(user['id'], user['role'])
        return jsonify({
            'success': True,
            'message': 'Registration successful! Welcome to StayEase.',
            'token': token,
            'user': User.to_dict(user)
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = User.find_by_email(email)
    if not user or not User.verify_password(user['password'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    token = generate_token(user['id'], user['role'])
    return jsonify({
        'success': True,
        'message': f'Welcome back, {user["name"]}!',
        'token': token,
        'user': User.to_dict(user)
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logged out successfully.'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'success': True,
        'user': User.to_dict(request.current_user)
    }), 200
