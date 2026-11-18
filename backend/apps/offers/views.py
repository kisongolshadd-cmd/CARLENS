from flask import request, jsonify

from config.extensions import db
from config.helpers import error, to_int
from apps.accounts.models import User
from apps.accounts.permissions import roles_required, current_user, optional_user
from apps.accounts.serializers import dealer_to_dict
from apps.accounts.notifications import notify
from apps.cars.models import Car
from apps.cars.serializers import car_to_dict
from apps.offers.models import OfferRequest, Offer, Review
from apps.offers.serializers import (
    offer_to_dict, request_to_dict, review_to_dict, dealer_rating,
)


@roles_required("buyer")
def create_request():
    user = current_user()
    data = request.get_json() or {}
    car_id = to_int(data.get("car_id"))
    notes = (data.get("notes") or "").strip()

    if car_id:
        car = db.session.get(Car, car_id)
        if car is None or car.kind != "stock" or car.status != "approved":
            return error("Car not found", 404)
        already = OfferRequest.query.filter_by(
            buyer_id=user.id, car_id=car_id, status="open").first()
        if already:
            return error("You already asked for offers on this car", 409)
        req = OfferRequest(buyer_id=user.id, car_id=car.id, make=car.make,
                           model=car.model, max_budget=car.price, notes=notes)
    else:
        make = (data.get("make") or "").strip()
        model = (data.get("model") or "").strip()
        budget = to_int(data.get("max_budget"))
        if not make:
            return error("Tell us which make of car you want")
        if budget is None or budget <= 0:
            return error("Enter your budget")
        req = OfferRequest(buyer_id=user.id, make=make, model=model,
                           max_budget=budget, notes=notes)

    db.session.add(req)

    what = f"{req.make} {req.model}".strip()
    for dealer in User.query.filter_by(role="dealer", dealer_status="approved").all():
        notify(dealer.id, f"New buyer request: {what}, budget KES {req.max_budget:,}", "/dealer/requests")
    db.session.commit()
    return jsonify(request=request_to_dict(req)), 201


@roles_required("buyer")
def my_requests():
    user = current_user()
    requests = OfferRequest.query.filter_by(buyer_id=user.id) \
        .order_by(OfferRequest.created_at.desc()).all()
    return jsonify(items=[request_to_dict(r, with_offers=True) for r in requests])


@roles_required("buyer")
def close_request(request_id):
    user = current_user()
    req = db.session.get(OfferRequest, request_id)
    if req is None or req.buyer_id != user.id:
        return error("Request not found", 404)
    req.status = "closed"
    for offer in req.offers:
        if offer.status == "pending":
            offer.status = "closed"
    db.session.commit()
    return jsonify(request=request_to_dict(req, with_offers=True))


def approved_dealer():
    user = current_user()
    if user.dealer_status != "approved":
        return None, error("Your account is waiting for approval", 403)
    return user, None


@roles_required("dealer")
def open_requests():
    user = current_user()
    requests = OfferRequest.query.filter_by(status="open") \
        .order_by(OfferRequest.created_at.desc()).all()
    items = []
    for req in requests:
        data = request_to_dict(req)
        mine = Offer.query.filter_by(request_id=req.id, dealer_id=user.id).first()
        data["my_offer"] = offer_to_dict(mine) if mine else None
        items.append(data)
    return jsonify(items=items)


@roles_required("dealer")
def create_offer():
    user, problem = approved_dealer()
    if problem:
        return problem

    data = request.get_json() or {}
    request_id = to_int(data.get("request_id"))
    car_id = to_int(data.get("car_id"))
    price = to_int(data.get("price"))
    message = (data.get("message") or "").strip()

    if price is None or price <= 0:
        return error("Enter your price")

    if request_id:
        req = db.session.get(OfferRequest, request_id)
        if req is None or req.status != "open":
            return error("This request is closed", 400)
        if Offer.query.filter_by(request_id=request_id, dealer_id=user.id).first():
            return error("You already sent an offer for this request", 409)
        offer = Offer(request_id=request_id, dealer_id=user.id, price=price, message=message)
    elif car_id:
        car = db.session.get(Car, car_id)
        if car is None or car.kind != "owner" or car.status != "approved":
            return error("Car not found", 404)
        if Offer.query.filter_by(car_id=car_id, dealer_id=user.id).first():
            return error("You already sent an offer for this car", 409)
        offer = Offer(car_id=car_id, dealer_id=user.id, price=price, message=message)
    else:
        return error("Choose a request or a car")

    db.session.add(offer)
    name = user.business_name or user.name
    if request_id:
        notify(req.buyer_id, f"{name} sent you an offer of KES {price:,}", "/buyer/offers")
    else:
        notify(car.owner_id, f"{name} sent an offer of KES {price:,} for your {car.make} {car.model}", "/seller/listings")
    db.session.commit()
    return jsonify(offer=offer_to_dict(offer)), 201


@roles_required("dealer")
def my_offers():
    user = current_user()
    offers = Offer.query.filter_by(dealer_id=user.id) \
        .order_by(Offer.created_at.desc()).all()
    return jsonify(items=[offer_to_dict(o, with_car=True, with_request=True) for o in offers])


@roles_required("seller")
def car_offers(car_id):
    user = current_user()
    car = db.session.get(Car, car_id)
    if car is None or car.owner_id != user.id:
        return error("Car not found", 404)
    offers = Offer.query.filter_by(car_id=car_id).order_by(Offer.price.desc()).all()
    return jsonify(items=[offer_to_dict(o) for o in offers])


def find_offer_for_owner(offer_id):
    user = current_user()
    offer = db.session.get(Offer, offer_id)
    if offer is None:
        return None, error("Offer not found", 404)

    if offer.request_id:
        allowed = offer.request.buyer_id == user.id
    else:
        allowed = offer.car is not None and offer.car.owner_id == user.id
    if not allowed:
        return None, error("Offer not found", 404)
    if offer.status != "pending":
        return None, error("This offer is no longer open")
    return offer, None


@roles_required("buyer", "seller")
def accept_offer(offer_id):
    offer, problem = find_offer_for_owner(offer_id)
    if problem:
        return problem

    offer.status = "accepted"
    if offer.request_id:
        for other in offer.request.offers:
            if other.id != offer.id and other.status == "pending":
                other.status = "closed"
        offer.request.status = "closed"
    else:
        others = Offer.query.filter_by(car_id=offer.car_id, status="pending").all()
        for other in others:
            if other.id != offer.id:
                other.status = "closed"
        offer.car.status = "sold"

    notify(offer.dealer_id, f"Your offer of KES {offer.price:,} was accepted. Open it to see the contact details.", "/dealer/requests")
    db.session.commit()
    return jsonify(offer=offer_to_dict(offer))


@roles_required("buyer", "seller")
def reject_offer(offer_id):
    offer, problem = find_offer_for_owner(offer_id)
    if problem:
        return problem
    offer.status = "rejected"
    notify(offer.dealer_id, f"Your offer of KES {offer.price:,} was declined.", "/dealer/requests")
    db.session.commit()
    return jsonify(offer=offer_to_dict(offer))


def accepted_a_deal(buyer_id, dealer_id):
    deal = Offer.query.join(OfferRequest, Offer.request_id == OfferRequest.id).filter(
        Offer.dealer_id == dealer_id,
        Offer.status == "accepted",
        OfferRequest.buyer_id == buyer_id,
    ).first()
    return deal is not None


def dealer_profile(dealer_id):
    user = optional_user()
    dealer = db.session.get(User, dealer_id)
    if dealer is None or dealer.role != "dealer" or dealer.dealer_status != "approved":
        return error("Dealer not found", 404)

    reviews = Review.query.filter_by(dealer_id=dealer_id) \
        .order_by(Review.created_at.desc()).all()
    cars = Car.query.filter_by(owner_id=dealer_id, kind="stock", status="approved") \
        .order_by(Car.created_at.desc()).limit(6).all()
    rating, count = dealer_rating(dealer_id)

    can_review = bool(user and user.role == "buyer" and accepted_a_deal(user.id, dealer_id))
    return jsonify(
        dealer=dealer_to_dict(dealer),
        rating=rating,
        review_count=count,
        reviews=[review_to_dict(r) for r in reviews],
        cars=[car_to_dict(c) for c in cars],
        can_review=can_review,
    )


@roles_required("buyer")
def create_review(dealer_id):
    user = current_user()
    data = request.get_json() or {}
    rating = to_int(data.get("rating"))
    comment = (data.get("comment") or "").strip()

    if rating is None or rating < 1 or rating > 5:
        return error("Choose 1 to 5 stars")
    if not accepted_a_deal(user.id, dealer_id):
        return error("You can only review a dealer after you accepted their offer", 403)

    review = Review.query.filter_by(buyer_id=user.id, dealer_id=dealer_id).first()
    if review is None:
        review = Review(buyer_id=user.id, dealer_id=dealer_id)
        db.session.add(review)
    review.rating = rating
    review.comment = comment
    db.session.commit()
    return jsonify(review=review_to_dict(review)), 201
