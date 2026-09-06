from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db
from models.user import User
from models.profile import Profile

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = int(get_jwt_identity())
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = Profile.query.filter_by(UserId=current_user_id).first()
    return jsonify({
        'id': user.UserId,
        'name': user.Name,
        'email': user.Email,
        'phone': profile.Phone if profile else None,
        'profileImage': profile.ProfileImage if profile else None,
        'createdAt': user.CreatedAt.isoformat() if user.CreatedAt else None
    }), 200


@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip() if 'phone' in data and data.get('phone') is not None else None

    if name:
        user.Name = name

    if email and email != user.Email:
        existing = User.query.filter_by(Email=email).first()
        if existing and existing.UserId != current_user_id:
            return jsonify({'error': 'Email is already in use by another account.'}), 400
        user.Email = email

    profile = Profile.query.filter_by(UserId=current_user_id).first()
    if not profile:
        profile = Profile(UserId=current_user_id)
        db.session.add(profile)

    if phone is not None:
        profile.Phone = phone

    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully!',
            'user': {
                'id': user.UserId,
                'name': user.Name,
                'email': user.Email,
                'phone': profile.Phone,
                'profileImage': profile.ProfileImage
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@profile_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    current_password = data.get('currentPassword', '')
    new_password = data.get('newPassword', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required.'}), 400

    if not check_password_hash(user.PasswordHash, current_password):
        return jsonify({'error': 'Incorrect current password.'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long.'}), 400

    user.PasswordHash = generate_password_hash(new_password)

    try:
        db.session.commit()
        return jsonify({'message': 'Password updated successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
