from functools import wraps

from flask import request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from config.extensions import db
from config.helpers import error
from apps.accounts.models import User


def current_user():
    user_id = get_jwt_identity()
    if user_id is None:
        return None
    return db.session.get(User, int(user_id))


def optional_user():
    verify_jwt_in_request(optional=True)
    return current_user()


def _guard(roles, need_verified):
    def decorator(function):
        @wraps(function)
        def inner(*args, **kwargs):
            verify_jwt_in_request()
            user = current_user()
            if user is None or not user.is_active:
                return error("Please log in again", 401)
            if user.role not in roles:
                return error("You are not allowed to do this", 403)
            if (need_verified and request.method != "GET" and user.role != "admin"
                    and not user.email_verified):
                return error("Please verify your email first. Check your inbox.", 403)
            return function(*args, **kwargs)
        return inner
    return decorator

def roles_required(*roles):
    return _guard(roles, True)


any_user = _guard(("buyer", "seller", "dealer", "admin"), False)
