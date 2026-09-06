from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = 'Users'

    UserId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(100), nullable=False)
    Email = db.Column(db.String(150), nullable=False, unique=True)
    PasswordHash = db.Column(db.String(255), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade="all, delete-orphan")
    budgets = db.relationship('Budget', backref='user', lazy=True, cascade="all, delete-orphan")
    profile = db.relationship('Profile', backref='user', uselist=False, lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.UserId,
            'name': self.Name,
            'email': self.Email,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
