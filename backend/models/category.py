from . import db

class Category(db.Model):
    __tablename__ = 'Categories'

    CategoryId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserId'), nullable=True)
    CategoryName = db.Column(db.String(100), nullable=False)
    CategoryType = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            'categoryId': self.CategoryId,
            'userId': self.UserId,
            'categoryName': self.CategoryName,
            'categoryType': self.CategoryType
        }
