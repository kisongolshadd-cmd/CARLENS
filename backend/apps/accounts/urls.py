from flask import Blueprint

from apps.accounts import views

bp = Blueprint("accounts", __name__, url_prefix="/api")

bp.add_url_rule("/auth/register", view_func=views.register, methods=["POST"])
bp.add_url_rule("/auth/login", view_func=views.login, methods=["POST"])
bp.add_url_rule("/auth/verify", view_func=views.verify_email, methods=["POST"])
bp.add_url_rule("/auth/resend-verification", view_func=views.resend_verification, methods=["POST"])
bp.add_url_rule("/auth/forgot", view_func=views.forgot_password, methods=["POST"])
bp.add_url_rule("/auth/reset", view_func=views.reset_password, methods=["POST"])
bp.add_url_rule("/auth/me", view_func=views.me, methods=["GET"])
bp.add_url_rule("/auth/me", endpoint="update_me", view_func=views.update_me, methods=["PUT"])
bp.add_url_rule("/auth/password", view_func=views.change_password, methods=["PUT"])
bp.add_url_rule("/notifications", view_func=views.list_notifications, methods=["GET"])
bp.add_url_rule("/notifications/read", view_func=views.read_notifications, methods=["POST"])

bp.add_url_rule("/admin/users", view_func=views.admin_users, methods=["GET"])
bp.add_url_rule("/admin/users/<int:user_id>/block", view_func=views.block_user, methods=["POST"])
bp.add_url_rule("/admin/users/<int:user_id>/unblock", view_func=views.unblock_user, methods=["POST"])
bp.add_url_rule("/admin/dealers", view_func=views.admin_dealers, methods=["GET"])
bp.add_url_rule("/admin/dealers/<int:user_id>/approve", view_func=views.approve_dealer, methods=["POST"])
bp.add_url_rule("/admin/dealers/<int:user_id>/reject", view_func=views.reject_dealer, methods=["POST"])
bp.add_url_rule("/admin/reports", view_func=views.reports, methods=["GET"])
bp.add_url_rule("/admin/dealers/<int:user_id>/licence", view_func=views.dealer_licence, methods=["GET"])
