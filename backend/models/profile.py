from datetime import datetime
from . import db

class Profile(db.Model):
    __tablename__ = 'Profiles'

    ProfileId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserId'), nullable=False)
    Phone = db.Column(db.String(20), nullable=True)
    ProfileImage = db.Column(db.String(500), nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'profileId': self.ProfileId,
            'userId': self.UserId,
            'phone': self.Phone,
            'profileImage': self.ProfileImage,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'updatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None
        }
