import os

from flask import Flask, jsonify
from flask_cors import CORS

from config.settings import Config
from config.extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    if os.getenv("APP_ENV") == "production" and "change-this" in (
            app.config["SECRET_KEY"] + app.config["JWT_SECRET_KEY"]):
        raise RuntimeError("Set real SECRET_KEY and JWT_SECRET_KEY in .env before going live")

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    from apps.accounts import models as accounts_models
    from apps.cars import models as cars_models
    from apps.offers import models as offers_models

    from config.urls import register_urls
    register_urls(app)

    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify(error="Please log in first"), 401

    @jwt.invalid_token_loader
    def bad_token(reason):
        return jsonify(error="Please log in again"), 401

    @jwt.expired_token_loader
    def old_token(header, payload):
        return jsonify(error="Your session has expired, please log in again"), 401

    @app.errorhandler(413)
    def too_big(e):
        return jsonify(error="The photo is too big (maximum 6 MB)"), 413

    @app.route("/api/health")
    def health():
        return jsonify(status="ok")

    with app.app_context():
        db.create_all()

    return app
