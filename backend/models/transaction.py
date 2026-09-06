from datetime import datetime
from . import db

class Transaction(db.Model):
    __tablename__ = 'Transactions'

    TransactionId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserId'), nullable=False)
    Type = db.Column(db.String(20), nullable=False)
    Amount = db.Column(db.Numeric(18, 2), nullable=False)
    Category = db.Column(db.String(100), nullable=False)
    Description = db.Column(db.String(500), nullable=True)
    TransactionDate = db.Column(db.Date, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.TransactionId,
            'userId': self.UserId,
            'type': self.Type,
            'amount': float(self.Amount) if self.Amount is not None else 0.0,
            'category': self.Category,
            'description': self.Description or '',
            'date': self.TransactionDate.strftime('%Y-%m-%d') if self.TransactionDate else None,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
