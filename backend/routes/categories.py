from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.category import Category

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')

DEFAULT_CATEGORIES = [
    {'name': 'Food', 'type': 'expense'},
    {'name': 'Rent', 'type': 'expense'},
    {'name': 'Transport', 'type': 'expense'},
    {'name': 'Shopping', 'type': 'expense'},
    {'name': 'Education', 'type': 'expense'},
    {'name': 'Entertainment', 'type': 'expense'},
    {'name': 'Salary', 'type': 'income'},
    {'name': 'Other', 'type': 'expense'}
]

@categories_bp.route('', methods=['GET'])
def get_categories():
    category_type = (request.args.get('type') or '').strip().lower()
    
    # Auto-seed default categories if table is empty
    if Category.query.count() == 0:
        try:
            for item in DEFAULT_CATEGORIES:
                cat = Category(CategoryName=item['name'], CategoryType=item['type'])
                db.session.add(cat)
            db.session.commit()
        except Exception:
            db.session.rollback()

    query = Category.query

    if category_type:
        query = query.filter(db.func.lower(Category.CategoryType) == category_type)

    categories = query.all()
    return jsonify([c.to_dict() for c in categories]), 200
