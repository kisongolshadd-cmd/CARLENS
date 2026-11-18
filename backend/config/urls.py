def register_urls(app):
    from apps.accounts.urls import bp as accounts_bp
    from apps.cars.urls import bp as cars_bp
    from apps.offers.urls import bp as offers_bp

    app.register_blueprint(accounts_bp)
    app.register_blueprint(cars_bp)
    app.register_blueprint(offers_bp)
