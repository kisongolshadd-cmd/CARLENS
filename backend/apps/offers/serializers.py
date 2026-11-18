from sqlalchemy import func

from config.extensions import db
from apps.accounts.serializers import dealer_to_dict
from apps.cars.serializers import car_to_dict
from apps.offers.models import Review
from apps.accounts.permissions import optional_user


def dealer_rating(dealer_id):
    average, count = db.session.query(func.avg(Review.rating), func.count(Review.id)) \
        .filter(Review.dealer_id == dealer_id).one()
    return (round(float(average), 1) if average else None), count


def offer_to_dict(offer, with_car=False, with_request=False):
    dealer = dealer_to_dict(offer.dealer)
    if dealer:
        dealer["rating"], dealer["review_count"] = dealer_rating(offer.dealer_id)

    data = {
        "id": offer.id,
        "request_id": offer.request_id,
        "car_id": offer.car_id,
        "price": offer.price,
        "message": offer.message,
        "status": offer.status,
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
        "dealer": dealer,
    }

    if offer.status == "accepted":
        viewer = optional_user()

        owner = offer.request.buyer if offer.request_id else (offer.car.owner if offer.car else None)
        if viewer is not None and owner is not None and viewer.id in (offer.dealer_id, owner.id):
            if viewer.id == offer.dealer_id:
                other, label = owner, owner.name
            else:
                other, label = offer.dealer, offer.dealer.business_name or offer.dealer.name
            data["contact"] = {"name": label, "phone": other.phone, "email": other.email}
    if with_car and offer.car:
        data["car"] = car_to_dict(offer.car)
    if with_request and offer.request:
        data["request"] = request_to_dict(offer.request)
    return data


def request_to_dict(req, with_offers=False):
    data = {
        "id": req.id,
        "make": req.make,
        "model": req.model,
        "max_budget": req.max_budget,
        "notes": req.notes,
        "status": req.status,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "buyer_name": req.buyer.name.split(" ")[0] if req.buyer else None,
        "car": car_to_dict(req.car) if req.car else None,
        "offers_count": len(req.offers),
    }
    if with_offers:
        data["offers"] = [offer_to_dict(offer) for offer in req.offers]
    return data


def review_to_dict(review):
    return {
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "buyer_name": review.buyer.name.split(" ")[0] if review.buyer else "Buyer",
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }
