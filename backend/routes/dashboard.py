from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import db
from models.transaction import Transaction
from models.budget import Budget

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = int(get_jwt_identity())
    today = date.today()
    current_month = today.month
    current_year = today.year

    all_user_transactions = Transaction.query.filter_by(UserId=current_user_id).all()

    # Current month transactions
    current_month_transactions = [
        t for t in all_user_transactions
        if t.TransactionDate and t.TransactionDate.month == current_month and t.TransactionDate.year == current_year
    ]

    total_income = sum(float(t.Amount) for t in current_month_transactions if (t.Type or '').lower() == 'income')
    total_expenses = sum(float(t.Amount) for t in current_month_transactions if (t.Type or '').lower() == 'expense')
    balance = total_income - total_expenses

    # Get budget for overall or most recent budget
    overall_budget_obj = Budget.query.filter_by(UserId=current_user_id, Category='Overall').first()
    if not overall_budget_obj:
        overall_budget_obj = Budget.query.filter_by(UserId=current_user_id).order_by(Budget.CreatedAt.desc()).first()

    budget_amount = float(overall_budget_obj.Amount) if overall_budget_obj else 0.0
    remaining_budget = budget_amount - total_expenses
    budget_percentage = round((total_expenses / budget_amount * 100), 1) if budget_amount > 0 else 0.0

    # Recent 5 transactions (newest first)
    sorted_transactions = sorted(
        all_user_transactions,
        key=lambda x: (x.TransactionDate or date.min, x.TransactionId),
        reverse=True
    )
    recent_transactions = [t.to_dict() for t in sorted_transactions[:5]]

    # Category spending breakdown
    category_spending = {}
    for t in current_month_transactions:
        if (t.Type or '').lower() == 'expense':
            cat = t.Category
            category_spending[cat] = category_spending.get(cat, 0.0) + float(t.Amount)

    return jsonify({
        'totalIncome': total_income,
        'totalExpenses': total_expenses,
        'balance': balance,
        'budget': budget_amount,
        'remainingBudget': remaining_budget,
        'budgetPercentage': budget_percentage,
        'recentTransactions': recent_transactions,
        'spendingByCategory': category_spending
    }), 200
