from flask import Blueprint

from apps.cars import views

bp = Blueprint("cars", __name__, url_prefix="/api")

bp.add_url_rule("/cars", view_func=views.list_cars, methods=["GET"])
bp.add_url_rule("/cars/<int:car_id>", view_func=views.get_car, methods=["GET"])

bp.add_url_rule("/cars", endpoint="create_car", view_func=views.create_car, methods=["POST"])
bp.add_url_rule("/cars/<int:car_id>", endpoint="update_car", view_func=views.update_car, methods=["PUT"])
bp.add_url_rule("/cars/<int:car_id>", endpoint="delete_car", view_func=views.delete_car, methods=["DELETE"])
bp.add_url_rule("/my-cars", view_func=views.my_cars, methods=["GET"])
bp.add_url_rule("/seller-listings", view_func=views.seller_listings, methods=["GET"])

bp.add_url_rule("/uploads", view_func=views.upload_photo, methods=["POST"])
bp.add_url_rule("/uploads/<name>", view_func=views.show_photo, methods=["GET"])

bp.add_url_rule("/favorites", view_func=views.list_favorites, methods=["GET"])
bp.add_url_rule("/favorites/<int:car_id>", view_func=views.toggle_favorite, methods=["POST"])

bp.add_url_rule("/admin/listings", view_func=views.pending_listings, methods=["GET"])
bp.add_url_rule("/admin/listings/<int:car_id>/approve", view_func=views.approve_listing, methods=["POST"])
bp.add_url_rule("/admin/listings/<int:car_id>/reject", view_func=views.reject_listing, methods=["POST"])
