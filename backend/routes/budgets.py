from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
import calendar
from models import db
from models.budget import Budget

budgets_bp = Blueprint('budgets', __name__, url_prefix='/api/budgets')

def get_month_range(year=None, month=None):
    today = date.today()
    y = year or today.year
    m = month or today.month
    start = date(y, m, 1)
    last_day = calendar.monthrange(y, m)[1]
    end = date(y, m, last_day)
    return start, end

@budgets_bp.route('', methods=['GET'])
@jwt_required()
def get_budgets():
    current_user_id = int(get_jwt_identity())
    budgets = Budget.query.filter_by(UserId=current_user_id).order_by(Budget.CreatedAt.desc()).all()
    return jsonify([b.to_dict() for b in budgets]), 200


@budgets_bp.route('', methods=['POST'])
@jwt_required()
def set_budget():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    amount = data.get('amount')
    category = (data.get('category') or 'Overall').strip() or 'Overall'
    start_date_str = (data.get('startDate') or '').strip()
    end_date_str = (data.get('endDate') or '').strip()

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({'error': 'Amount must be a positive number.'}), 400

    if start_date_str and end_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
    else:
        start_date, end_date = get_month_range()

    # Check if a budget for this user and category already exists
    existing_budget = Budget.query.filter_by(UserId=current_user_id, Category=category).first()
    
    if existing_budget:
        existing_budget.Amount = amount
        existing_budget.StartDate = start_date
        existing_budget.EndDate = end_date
        target_budget = existing_budget
    else:
        target_budget = Budget(
            UserId=current_user_id,
            Category=category,
            Amount=amount,
            StartDate=start_date,
            EndDate=end_date
        )
        db.session.add(target_budget)

    try:
        db.session.commit()
        return jsonify({
            'message': 'Budget saved successfully!',
            'budget': target_budget.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@budgets_bp.route('/<int:b_id>', methods=['PUT'])
@jwt_required()
def update_budget(b_id):
    current_user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(BudgetId=b_id, UserId=current_user_id).first()

    if not budget:
        return jsonify({'error': 'Budget not found or access denied.'}), 404

    data = request.get_json() or {}

    if 'amount' in data:
        try:
            amt = float(data['amount'])
            if amt > 0:
                budget.Amount = amt
        except (TypeError, ValueError):
            pass

    if 'category' in data and data['category']:
        budget.Category = str(data['category']).strip()

    if 'startDate' in data and data['startDate']:
        try:
            budget.StartDate = datetime.strptime(str(data['startDate']).strip(), '%Y-%m-%d').date()
        except ValueError:
            pass

    if 'endDate' in data and data['endDate']:
        try:
            budget.EndDate = datetime.strptime(str(data['endDate']).strip(), '%Y-%m-%d').date()
        except ValueError:
            pass

    try:
        db.session.commit()
        return jsonify({
            'message': 'Budget updated successfully!',
            'budget': budget.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@budgets_bp.route('/<int:b_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(b_id):
    current_user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(BudgetId=b_id, UserId=current_user_id).first()

    if not budget:
        return jsonify({'error': 'Budget not found or access denied.'}), 404

    try:
        db.session.delete(budget)
        db.session.commit()
        return jsonify({'message': 'Budget deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
