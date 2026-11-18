from flask import Blueprint

from apps.offers import views

bp = Blueprint("offers", __name__, url_prefix="/api")

bp.add_url_rule("/requests", view_func=views.create_request, methods=["POST"])
bp.add_url_rule("/requests/mine", view_func=views.my_requests, methods=["GET"])
bp.add_url_rule("/requests/<int:request_id>/close", view_func=views.close_request, methods=["POST"])

bp.add_url_rule("/requests/open", view_func=views.open_requests, methods=["GET"])
bp.add_url_rule("/offers", view_func=views.create_offer, methods=["POST"])
bp.add_url_rule("/offers/mine", view_func=views.my_offers, methods=["GET"])

bp.add_url_rule("/seller/cars/<int:car_id>/offers", view_func=views.car_offers, methods=["GET"])

bp.add_url_rule("/offers/<int:offer_id>/accept", view_func=views.accept_offer, methods=["POST"])
bp.add_url_rule("/offers/<int:offer_id>/reject", view_func=views.reject_offer, methods=["POST"])

bp.add_url_rule("/dealers/<int:dealer_id>", view_func=views.dealer_profile, methods=["GET"])
bp.add_url_rule("/dealers/<int:dealer_id>/reviews", view_func=views.create_review, methods=["POST"])
