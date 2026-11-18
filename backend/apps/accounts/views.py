import os
import re
import secrets
import time
from flask import request, jsonify, current_app, send_from_directory
from flask_jwt_extended import create_access_token

from config.extensions import db
from config.helpers import error
from apps.accounts.models import User, Notification
from apps.accounts.mailer import (read_token, send_verify_email, send_reset_email)
from apps.accounts.notifications import notify, notify_admins
from apps.accounts.permissions import roles_required, any_user, current_user
from apps.accounts.serializers import user_to_dict
from apps.cars.models import Car
from apps.offers.models import OfferRequest, Offer

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

ID_PATTERN = re.compile(r"^\d{7,9}$")
LICENCE_TYPES = {"jpg": b"\xff\xd8", "png": b"\x89PNG", "webp": b"RIFF", "pdf": b"%PDF"}

FAILED_LOGINS = {}
MAX_FAILS, WAIT_SECONDS = 5, 600


def register():
    data = request.get_json(silent=True) or request.form
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    role = data.get("role") or "buyer"
    business_name = (data.get("business_name") or "").strip()
    location = (data.get("location") or "").strip()
    national_id = (data.get("national_id") or "").strip()
    licence = request.files.get("licence")

    if not name or not email or not password:
        return error("Name, email and password are required")
    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email")
    if len(password) < 6:
        return error("Password must have at least 6 characters")
    if role not in ("buyer", "seller", "dealer"):
        return error("Choose buyer, seller or dealer")
    if role == "dealer" and not business_name:
        return error("Dealers must enter their business name")
    if role in ("seller", "dealer") and not ID_PATTERN.match(national_id):
        return error("Enter your national ID number (7 to 9 digits)")
    licence_name = None
    if role == "dealer":
        if licence is None or not licence.filename:
            return error("Dealers must upload their business licence (photo or PDF)")
        extension = licence.filename.rsplit(".", 1)[-1].lower().replace("jpeg", "jpg")
        first_bytes = licence.stream.read(4)
        licence.stream.seek(0)
        if extension not in LICENCE_TYPES or not first_bytes.startswith(LICENCE_TYPES[extension]):
            return error("Upload the licence as a JPG, PNG, WEBP or PDF file")
    if User.query.filter_by(email=email).first():
        return error("Email already exists", 409)

    user = User(name=name, email=email, phone=phone, role=role, location=location,
                national_id=national_id or None)
    user.set_password(password)
    if role == "dealer":
        folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "private")
        os.makedirs(folder, exist_ok=True)
        licence_name = secrets.token_hex(8) + "." + extension
        licence.save(os.path.join(folder, licence_name))
        user.licence_file = licence_name
        user.business_name = business_name
        user.dealer_status = "pending"
    db.session.add(user)
    db.session.flush()
    if role == "dealer":
        notify_admins(f"New dealer waiting for approval: {business_name}", "/admin/dealers")
    db.session.commit()

    extra = send_verify_email(user)
    return jsonify(message="Account created", user=user_to_dict(user), **extra), 201


def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    recent = [t for t in FAILED_LOGINS.get(email, []) if time.time() - t < WAIT_SECONDS]
    if len(recent) >= MAX_FAILS:
        return error("Too many wrong tries. Please wait 10 minutes and try again.", 429)

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        FAILED_LOGINS[email] = recent + [time.time()]
        return error("Invalid email or password", 401)
    FAILED_LOGINS.pop(email, None)
    if not user.is_active:
        return error("Your account has been blocked", 403)

    token = create_access_token(identity=str(user.id))
    return jsonify(token=token, user=user_to_dict(user))


def verify_email():
    data = request.get_json() or {}
    user_id = read_token(data.get("token") or "", "verify", 3 * 24 * 3600)
    user = db.session.get(User, user_id) if user_id else None
    if user is None:
        return error("This link is wrong or has expired. Ask for a new one.", 400)
    user.email_verified = True
    db.session.commit()
    return jsonify(message="Email verified", user=user_to_dict(user))


@any_user
def resend_verification():
    user = current_user()
    if user.email_verified:
        return jsonify(message="Your email is already verified")
    extra = send_verify_email(user)
    return jsonify(message="We sent you a new link. Check your inbox.", **extra)


def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    extra = {}
    if user is not None and user.is_active:
        extra = send_reset_email(user)
    return jsonify(message="If that email has an account, we sent a reset link.", **extra)


def reset_password():
    data = request.get_json() or {}
    password = data.get("password") or ""
    if len(password) < 6:
        return error("Password must have at least 6 characters")
    info = read_token(data.get("token") or "", "reset", 3600)
    user = db.session.get(User, info[0]) if info else None
    if user is None or user.password_hash[-10:] != info[1]:
        return error("This link is wrong, used already or expired. Ask for a new one.", 400)
    user.set_password(password)
    user.email_verified = True
    db.session.commit()
    FAILED_LOGINS.pop(user.email, None)
    return jsonify(message="Password changed. You can log in now.")


@roles_required("admin")
def dealer_licence(user_id):
    dealer = db.session.get(User, user_id)
    if dealer is None or not dealer.licence_file:
        return error("No licence uploaded", 404)
    return send_from_directory(os.path.join(current_app.config["UPLOAD_FOLDER"], "private"),
                               dealer.licence_file)


@any_user
def me():
    return jsonify(user=user_to_dict(current_user()))


@any_user
def update_me():
    user = current_user()
    data = request.get_json() or {}
    name = (data.get("name") or user.name).strip()
    if not name:
        return error("Name is required")
    user.name = name
    user.phone = (data.get("phone") or "").strip()
    user.location = (data.get("location") or "").strip()
    if user.role == "dealer":
        business = (data.get("business_name") or "").strip()
        if not business:
            return error("Dealers must enter their business name")
        user.business_name = business
    db.session.commit()
    return jsonify(user=user_to_dict(user))


@any_user
def change_password():
    user = current_user()
    data = request.get_json() or {}
    if not user.check_password(data.get("old_password") or ""):
        return error("Your old password is wrong", 400)
    new_password = data.get("new_password") or ""
    if len(new_password) < 6:
        return error("New password must have at least 6 characters")
    user.set_password(new_password)
    db.session.commit()
    return jsonify(message="Password changed")


@any_user
def list_notifications():
    user = current_user()
    rows = Notification.query.filter_by(user_id=user.id) \
        .order_by(Notification.created_at.desc()).limit(30).all()
    items = [{"id": n.id, "text": n.text, "link": n.link, "is_read": n.is_read,
              "created_at": n.created_at.isoformat()} for n in rows]
    unread = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify(items=items, unread=unread)


@any_user
def read_notifications():
    user = current_user()
    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify(message="ok")


@roles_required("admin")
def admin_users():
    query = User.query
    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q}%"
        query = query.filter(db.or_(User.name.ilike(like), User.email.ilike(like)))
    users = query.order_by(User.created_at.desc()).all()
    return jsonify(items=[user_to_dict(u) for u in users])


def _change_active(user_id, active):
    user = db.session.get(User, user_id)
    if user is None:
        return error("User not found", 404)
    if user.role == "admin":
        return error("You cannot block an admin")
    user.is_active = active
    db.session.commit()
    return jsonify(user=user_to_dict(user))


@roles_required("admin")
def block_user(user_id):
    return _change_active(user_id, False)


@roles_required("admin")
def unblock_user(user_id):
    return _change_active(user_id, True)


@roles_required("admin")
def admin_dealers():
    status = request.args.get("status", "pending")
    dealers = User.query.filter_by(role="dealer", dealer_status=status) \
        .order_by(User.created_at.desc()).all()
    return jsonify(items=[user_to_dict(d) for d in dealers])


def _set_dealer_status(user_id, status):
    dealer = db.session.get(User, user_id)
    if dealer is None or dealer.role != "dealer":
        return error("Dealer not found", 404)
    dealer.dealer_status = status
    if status == "approved":
        notify(dealer.id, "Your dealer account is approved. You can now add cars and send offers.", "/dealer")
    else:
        notify(dealer.id, "Your dealer account was not approved.", "/dealer")
    db.session.commit()
    return jsonify(user=user_to_dict(dealer))


@roles_required("admin")
def approve_dealer(user_id):
    return _set_dealer_status(user_id, "approved")


@roles_required("admin")
def reject_dealer(user_id):
    return _set_dealer_status(user_id, "rejected")


@roles_required("admin")
def reports():
    return jsonify(
        total_users=User.query.count(),
        buyers=User.query.filter_by(role="buyer").count(),
        sellers=User.query.filter_by(role="seller").count(),
        dealers=User.query.filter_by(role="dealer").count(),
        pending_dealers=User.query.filter_by(role="dealer", dealer_status="pending").count(),
        total_cars=Car.query.count(),
        pending_listings=Car.query.filter_by(status="pending").count(),
        total_requests=OfferRequest.query.count(),
        total_offers=Offer.query.count(),
        completed_sales=Offer.query.filter_by(status="accepted").count(),
    )
