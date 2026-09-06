from datetime import datetime
from . import db

class Budget(db.Model):
    __tablename__ = 'Budgets'

    BudgetId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserId'), nullable=False)
    Category = db.Column(db.String(100), nullable=False)
    Amount = db.Column(db.Numeric(18, 2), nullable=False)
    StartDate = db.Column(db.Date, nullable=False)
    EndDate = db.Column(db.Date, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'budgetId': self.BudgetId,
            'userId': self.UserId,
            'category': self.Category,
            'amount': float(self.Amount) if self.Amount is not None else 0.0,
            'startDate': self.StartDate.strftime('%Y-%m-%d') if self.StartDate else None,
            'endDate': self.EndDate.strftime('%Y-%m-%d') if self.EndDate else None,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
