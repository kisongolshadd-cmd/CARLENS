from datetime import datetime

from config.extensions import db


class Car(db.Model):
    __tablename__ = "cars"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    kind = db.Column(db.String(10), nullable=False, default="stock")

    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(80), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    mileage = db.Column(db.Integer, default=0)
    fuel = db.Column(db.String(20))
    transmission = db.Column(db.String(20))
    body_type = db.Column(db.String(30))
    location = db.Column(db.String(80))
    color = db.Column(db.String(10), default="#7C3AED")
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    gallery = db.Column(db.Text)

    status = db.Column(db.String(20), default="approved")
    reject_reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship("User")


class Favorite(db.Model):
    __tablename__ = "favorites"
    __table_args__ = (db.UniqueConstraint("user_id", "car_id"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey("cars.id"), nullable=False)

    car = db.relationship("Car")
