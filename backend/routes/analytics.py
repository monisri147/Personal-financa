from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.transaction import Transaction
from models.budget import Budget

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('', methods=['GET'])
@jwt_required()
def get_analytics():
    current_user_id = int(get_jwt_identity())
    transactions = Transaction.query.filter_by(UserId=current_user_id).all()

    total_income = sum(float(t.Amount) for t in transactions if (t.Type or '').lower() == 'income')
    total_expense = sum(float(t.Amount) for t in transactions if (t.Type or '').lower() == 'expense')
    balance = total_income - total_expense

    # Category totals (expenses)
    category_totals = {}
    for t in transactions:
        if (t.Type or '').lower() == 'expense':
            cat = t.Category
            category_totals[cat] = category_totals.get(cat, 0.0) + float(t.Amount)

    # Convert category totals to structured list with percentage
    spending_by_category = []
    for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = round((amt / total_expense * 100), 1) if total_expense > 0 else 0.0
        spending_by_category.append({
            'category': cat,
            'amount': amt,
            'percentage': pct
        })

    # Monthly breakdown (YYYY-MM)
    monthly_data = {}
    for t in transactions:
        if t.TransactionDate:
            month_key = t.TransactionDate.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'income': 0.0, 'expense': 0.0}
            if (t.Type or '').lower() == 'income':
                monthly_data[month_key]['income'] += float(t.Amount)
            else:
                monthly_data[month_key]['expense'] += float(t.Amount)

    monthly_summary = [
        {
            'month': month_key,
            'income': data['income'],
            'expense': data['expense']
        }
        for month_key, data in sorted(monthly_data.items())
    ]

    return jsonify({
        'totalIncome': total_income,
        'totalExpense': total_expense,
        'balance': balance,
        'spendingByCategory': spending_by_category,
        'monthlySummary': monthly_summary
    }), 200
