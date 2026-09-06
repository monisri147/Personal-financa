from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.profile import Profile

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = str(data.get('password') or '')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    existing_user = User.query.filter_by(Email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email already exists.'}), 400

    hashed_password = generate_password_hash(password)
    
    new_user = User(
        Name=name,
        Email=email,
        PasswordHash=hashed_password
    )

    try:
        db.session.add(new_user)
        db.session.flush()  # Get generated UserId

        # Create matching profile entry
        new_profile = Profile(
            UserId=new_user.UserId
        )
        db.session.add(new_profile)
        db.session.commit()

        token = create_access_token(identity=str(new_user.UserId))
        return jsonify({
            'message': 'Account created successfully!',
            'user': new_user.to_dict(),
            'token': token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = str(data.get('password') or '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(Email=email).first()
    if not user or not check_password_hash(user.PasswordHash, password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    token = create_access_token(identity=str(user.UserId))
    return jsonify({
        'message': 'Login successful!',
        'user': user.to_dict(),
        'token': token
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully!'}), 200
