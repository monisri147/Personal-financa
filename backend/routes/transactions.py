from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db
from models.transaction import Transaction

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user_id = int(get_jwt_identity())
    
    category = (request.args.get('category') or '').strip()
    date_str = (request.args.get('date') or '').strip()
    t_type = (request.args.get('type') or '').strip().lower()

    query = Transaction.query.filter_by(UserId=current_user_id)

    if category and category != 'all':
        query = query.filter_by(Category=category)

    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter_by(TransactionDate=target_date)
        except ValueError:
            pass

    if t_type:
        query = query.filter_by(Type=t_type)

    # Order by date descending, then id descending
    transactions = query.order_by(Transaction.TransactionDate.desc(), Transaction.TransactionId.desc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200


@transactions_bp.route('/<int:t_id>', methods=['GET'])
@jwt_required()
def get_transaction(t_id):
    current_user_id = int(get_jwt_identity())
    transaction = Transaction.query.filter_by(TransactionId=t_id, UserId=current_user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found or access denied.'}), 404

    return jsonify(transaction.to_dict()), 200


@transactions_bp.route('', methods=['POST'])
@jwt_required()
def add_transaction():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    t_type = (data.get('type') or '').strip().lower()
    amount = data.get('amount')
    category = (data.get('category') or '').strip()
    description = (data.get('description') or '').strip()
    date_str = (data.get('date') or '').strip()

    if not t_type or t_type not in ['income', 'expense']:
        return jsonify({'error': 'Type must be either "income" or "expense".'}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({'error': 'Amount must be a positive number.'}), 400

    if not category:
        return jsonify({'error': 'Category is required.'}), 400

    if not date_str:
        return jsonify({'error': 'Transaction date is required.'}), 400

    try:
        t_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    new_transaction = Transaction(
        UserId=current_user_id,
        Type=t_type,
        Amount=amount,
        Category=category,
        Description=description or 'No description',
        TransactionDate=t_date
    )

    try:
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({
            'message': 'Transaction added successfully!',
            'transaction': new_transaction.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@transactions_bp.route('/<int:t_id>', methods=['PUT'])
@jwt_required()
def update_transaction(t_id):
    current_user_id = int(get_jwt_identity())
    transaction = Transaction.query.filter_by(TransactionId=t_id, UserId=current_user_id).first()

    if not transaction:
        return jsonify({'error': 'Transaction not found or access denied.'}), 404

    data = request.get_json() or {}

    if 'type' in data:
        t_type = str(data['type']).strip().lower()
        if t_type in ['income', 'expense']:
            transaction.Type = t_type

    if 'amount' in data:
        try:
            amt = float(data['amount'])
            if amt > 0:
                transaction.Amount = amt
        except (TypeError, ValueError):
            pass

    if 'category' in data and data['category']:
        transaction.Category = str(data['category']).strip()

    if 'description' in data:
        transaction.Description = str(data['description']).strip()

    if 'date' in data and data['date']:
        try:
            t_date = datetime.strptime(str(data['date']).strip(), '%Y-%m-%d').date()
            transaction.TransactionDate = t_date
        except ValueError:
            pass

    try:
        db.session.commit()
        return jsonify({
            'message': 'Transaction updated successfully!',
            'transaction': transaction.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@transactions_bp.route('/<int:t_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(t_id):
    current_user_id = int(get_jwt_identity())
    transaction = Transaction.query.filter_by(TransactionId=t_id, UserId=current_user_id).first()

    if not transaction:
        return jsonify({'error': 'Transaction not found or access denied.'}), 404

    try:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
