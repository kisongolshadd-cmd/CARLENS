from datetime import datetime

from config.extensions import db


class OfferRequest(db.Model):
    __tablename__ = "offer_requests"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey("cars.id"))
    make = db.Column(db.String(50))
    model = db.Column(db.String(80))
    max_budget = db.Column(db.Integer)
    notes = db.Column(db.Text)

    status = db.Column(db.String(20), default="open")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    buyer = db.relationship("User")
    car = db.relationship("Car")
    offers = db.relationship("Offer", back_populates="request",
                             order_by="Offer.price.asc()")


class Offer(db.Model):
    __tablename__ = "offers"

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey("offer_requests.id"))
    car_id = db.Column(db.Integer, db.ForeignKey("cars.id"))
    dealer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    message = db.Column(db.Text)

    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    request = db.relationship("OfferRequest", back_populates="offers")
    dealer = db.relationship("User")
    car = db.relationship("Car")


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    dealer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    buyer = db.relationship("User", foreign_keys=[buyer_id])
    dealer = db.relationship("User", foreign_keys=[dealer_id])
