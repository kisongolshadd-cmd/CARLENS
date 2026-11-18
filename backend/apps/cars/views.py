import os
import random
import secrets
from flask import request, jsonify, send_from_directory, current_app

from config.extensions import db
from config.helpers import error, to_int
from apps.accounts.permissions import roles_required, current_user, optional_user
from apps.accounts.notifications import notify, notify_admins
from apps.cars.models import Car, Favorite
from apps.cars.serializers import car_to_dict
from apps.offers.models import Offer, OfferRequest

COLORS = ["#7C3AED", "#2563EB", "#16A34A", "#EF4444", "#F59E0B",
          "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#8B5CF6"]


def favorite_ids_of(user):
    if user is None:
        return set()
    rows = Favorite.query.filter_by(user_id=user.id).all()
    return {row.car_id for row in rows}


def read_car_form(data, car=None):
    fields = {}

    for name in ("make", "model"):
        if name in data or car is None:
            value = (data.get(name) or "").strip()
            if not value:
                return None, f"{name.capitalize()} is required"
            fields[name] = value

    if "year" in data or car is None:
        year = to_int(data.get("year"))
        if year is None or year < 1980 or year > 2027:
            return None, "Enter a year between 1980 and 2027"
        fields["year"] = year

    if "price" in data or car is None:
        price = to_int(data.get("price"))
        if price is None or price <= 0:
            return None, "Enter a price greater than 0"
        fields["price"] = price

    if "mileage" in data:
        mileage = to_int(data.get("mileage"))
        if mileage is None or mileage < 0:
            return None, "Mileage must be a number"
        fields["mileage"] = mileage

    for name in ("fuel", "transmission", "body_type", "location",
                 "description", "image_url", "color"):
        if name in data:
            fields[name] = (data.get(name) or "").strip()

    if "gallery" in data:
        links = [str(link).strip() for link in (data.get("gallery") or []) if str(link).strip()]
        fields["gallery"] = "\n".join(links[:6])

    return fields, None

PHOTO_TYPES = {"jpg": b"\xff\xd8\xff", "png": b"\x89PNG", "webp": b"RIFF"}


@roles_required("dealer", "seller")
def upload_photo():
    file = request.files.get("photo")
    if file is None or not file.filename:
        return error("Choose a photo")
    extension = file.filename.rsplit(".", 1)[-1].lower().replace("jpeg", "jpg")
    first_bytes = file.stream.read(4)
    file.stream.seek(0)
    if extension not in PHOTO_TYPES or not first_bytes.startswith(PHOTO_TYPES[extension]):
        return error("Use a JPG, PNG or WEBP photo")

    folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(folder, exist_ok=True)
    name = secrets.token_hex(8) + "." + extension
    file.save(os.path.join(folder, name))
    return jsonify(url="/api/uploads/" + name), 201


def show_photo(name):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], name)


def list_cars():
    user = optional_user()
    query = Car.query.filter_by(kind="stock", status="approved")

    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q}%"
        query = query.filter(db.or_(Car.make.ilike(like), Car.model.ilike(like),
                                    Car.description.ilike(like)))

    for name in ("make", "body_type", "fuel", "transmission"):
        value = request.args.get(name, "").strip()
        if value:
            query = query.filter(getattr(Car, name).ilike(value))

    location = request.args.get("location", "").strip()
    if location:
        query = query.filter(Car.location.ilike(f"%{location}%"))

    min_price = to_int(request.args.get("min_price"))
    max_price = to_int(request.args.get("max_price"))
    if min_price is not None:
        query = query.filter(Car.price >= min_price)
    if max_price is not None:
        query = query.filter(Car.price <= max_price)

    sort = request.args.get("sort", "newest")
    if sort == "price_low":
        query = query.order_by(Car.price.asc())
    elif sort == "price_high":
        query = query.order_by(Car.price.desc())
    else:
        query = query.order_by(Car.created_at.desc(), Car.id.desc())

    page = to_int(request.args.get("page")) or 1
    per_page = min(to_int(request.args.get("per_page")) or 9, 50)
    result = query.paginate(page=page, per_page=per_page, error_out=False)

    favorites = favorite_ids_of(user)
    return jsonify(
        items=[car_to_dict(car, favorites) for car in result.items],
        page=result.page,
        pages=result.pages,
        total=result.total,
    )


def get_car(car_id):
    user = optional_user()
    car = db.session.get(Car, car_id)
    if car is None:
        return error("Car not found", 404)

    public = car.kind == "stock" and car.status == "approved"
    if not public:
        allowed = user is not None and (
            user.id == car.owner_id
            or user.role == "admin"
            or (user.role == "dealer" and car.kind == "owner")
        )
        if not allowed:
            return error("Car not found", 404)

    return jsonify(car=car_to_dict(car, favorite_ids_of(user)))


@roles_required("dealer", "seller")
def create_car():
    user = current_user()
    if user.role == "dealer" and user.dealer_status != "approved":
        return error("Your account is waiting for approval", 403)

    fields, message = read_car_form(request.get_json() or {})
    if message:
        return error(message)

    car = Car(owner_id=user.id, **fields)
    if not car.color:
        car.color = random.choice(COLORS)
    if user.role == "dealer":
        car.kind, car.status = "stock", "approved"
    else:
        car.kind, car.status = "owner", "pending"
    if not car.location:
        car.location = user.location

    db.session.add(car)
    if car.kind == "owner":
        notify_admins(f"New listing waiting: {car.year} {car.make} {car.model}", "/admin/listings")
    db.session.commit()
    return jsonify(car=car_to_dict(car)), 201


@roles_required("dealer", "seller")
def update_car(car_id):
    user = current_user()
    car = db.session.get(Car, car_id)
    if car is None or car.owner_id != user.id:
        return error("Car not found", 404)

    fields, message = read_car_form(request.get_json() or {}, car)
    if message:
        return error(message)
    for name, value in fields.items():
        setattr(car, name, value)

    if car.status == "rejected":
        car.status, car.reject_reason = "pending", None

    db.session.commit()
    return jsonify(car=car_to_dict(car))


@roles_required("dealer", "seller", "admin")
def delete_car(car_id):
    user = current_user()
    car = db.session.get(Car, car_id)
    if car is None or (car.owner_id != user.id and user.role != "admin"):
        return error("Car not found", 404)

    for req in OfferRequest.query.filter_by(car_id=car.id).all():
        Offer.query.filter_by(request_id=req.id).delete()
        db.session.delete(req)
    Offer.query.filter_by(car_id=car.id).delete()
    Favorite.query.filter_by(car_id=car.id).delete()
    db.session.delete(car)
    db.session.commit()
    return jsonify(message="Car deleted")


@roles_required("dealer", "seller")
def my_cars():
    user = current_user()
    cars = Car.query.filter_by(owner_id=user.id).order_by(Car.created_at.desc()).all()
    items = []
    for car in cars:
        data = car_to_dict(car)
        data["offers_count"] = Offer.query.filter_by(car_id=car.id).count()
        items.append(data)
    return jsonify(items=items)


@roles_required("dealer")
def seller_listings():
    user = current_user()
    cars = Car.query.filter_by(kind="owner", status="approved") \
        .order_by(Car.created_at.desc()).all()
    items = []
    for car in cars:
        data = car_to_dict(car)
        mine = Offer.query.filter_by(car_id=car.id, dealer_id=user.id).first()
        data["my_offer_status"] = mine.status if mine else None
        items.append(data)
    return jsonify(items=items)


@roles_required("buyer")
def list_favorites():
    user = current_user()
    rows = Favorite.query.filter_by(user_id=user.id).order_by(Favorite.id.desc()).all()
    cars = [row.car for row in rows if row.car and row.car.status == "approved"]
    return jsonify(items=[car_to_dict(car, {car.id for car in cars}) for car in cars])


@roles_required("buyer")
def toggle_favorite(car_id):
    user = current_user()
    car = db.session.get(Car, car_id)
    if car is None or car.kind != "stock":
        return error("Car not found", 404)

    row = Favorite.query.filter_by(user_id=user.id, car_id=car_id).first()
    if row:
        db.session.delete(row)
        saved = False
    else:
        db.session.add(Favorite(user_id=user.id, car_id=car_id))
        saved = True
    db.session.commit()
    return jsonify(is_favorite=saved)


@roles_required("admin")
def pending_listings():
    cars = Car.query.filter_by(kind="owner", status="pending") \
        .order_by(Car.created_at.asc()).all()
    return jsonify(items=[car_to_dict(car) for car in cars])


@roles_required("admin")
def approve_listing(car_id):
    car = db.session.get(Car, car_id)
    if car is None or car.kind != "owner":
        return error("Listing not found", 404)
    car.status, car.reject_reason = "approved", None
    notify(car.owner_id, f"Your {car.make} {car.model} was approved. Dealers can now send offers.", "/seller/listings")
    db.session.commit()
    return jsonify(car=car_to_dict(car))


@roles_required("admin")
def reject_listing(car_id):
    car = db.session.get(Car, car_id)
    if car is None or car.kind != "owner":
        return error("Listing not found", 404)
    data = request.get_json() or {}
    car.status = "rejected"
    car.reject_reason = (data.get("reason") or "Please check the details and try again").strip()
    notify(car.owner_id, f"Your {car.make} {car.model} was not approved: {car.reject_reason}", "/seller/listings")
    db.session.commit()
    return jsonify(car=car_to_dict(car))
