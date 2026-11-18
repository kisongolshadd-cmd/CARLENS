import os
import sys
from datetime import datetime, timedelta

from config import create_app
from config.extensions import db
from apps.accounts.models import User
from apps.cars.models import Car, Favorite
from apps.offers.models import OfferRequest, Offer, Review

app = create_app()


def make_user(name, email, role, phone="", business_name=None, location=None, status="approved", national_id=None):
    user = User(name=name, email=email, role=role, phone=phone,
                business_name=business_name, location=location, dealer_status=status,
                national_id=national_id, email_verified=True)
    user.set_password("password123")
    db.session.add(user)
    return user


def make_car(owner, kind, make, model, year, price, mileage, fuel, transmission,
             body_type, location, color, description, status="approved", days_ago=0):
    photo = "/cars/" + (make + "-" + model).lower().replace(" ", "-") + ".jpg"

    second = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "cars", photo[6:-4] + "-2.jpg")
    gallery = photo[:-4] + "-2.jpg" if os.path.exists(second) else ""
    car = Car(owner=owner, kind=kind, make=make, model=model, year=year, price=price,
              mileage=mileage, fuel=fuel, transmission=transmission, body_type=body_type,
              location=location, color=color, description=description, status=status, image_url=photo, gallery=gallery,
              created_at=datetime.utcnow() - timedelta(days=days_ago))
    db.session.add(car)
    return car

with app.app_context():
    if "--reset" in sys.argv:
        db.drop_all()
        db.create_all()
        print("Old data deleted.")

    if User.query.count() > 0:
        print("The database already has data. Use  python seed.py --reset  to start again.")
        sys.exit()

    admin = make_user("Site Admin", "admin@carlens.com", "admin", "0700000000")
    buyer = make_user("Amina Wanjiru", "amina@example.com", "buyer", "0711111111")
    buyer2 = make_user("Brian Otieno", "brian@example.com", "buyer", "0722222222")
    seller = make_user("Kevin Mutua", "kevin@example.com", "seller", "0733333333", location="Nairobi", national_id="31245678")
    dealer1 = make_user("Faith Njeri", "faith@example.com", "dealer", "0744444444",
                        "Faith Motors", "Nairobi", national_id="28123456")
    dealer2 = make_user("Hassan Ali", "hassan@example.com", "dealer", "0755555555",
                        "Coast Auto Hub", "Mombasa", national_id="25987654")
    dealer3 = make_user("Grace Chebet", "grace@example.com", "dealer", "0766666666",
                        "Rift Valley Cars", "Nakuru", status="pending", national_id="30456789")
    db.session.flush()

    stock = [
        (dealer1, "Mercedes-Benz", "C300", 2019, 4950000, 42000, "Petrol", "Automatic", "Sedan", "Nairobi", "#7C3AED",
         "AMG line, panoramic roof, LED headlights and a full service history."),
        (dealer1, "BMW", "X1", 2017, 3650000, 61000, "Petrol", "Automatic", "SUV", "Nairobi", "#F59E0B",
         "xLine package, leather seats, big alloy wheels and a clean interior."),
        (dealer1, "Cadillac", "Escalade", 2024, 21500000, 6000, "Petrol", "Automatic", "SUV", "Nairobi", "#2563EB",
         "Luxury full size SUV, almost new, three rows of seats and an OLED screen."),
        (dealer1, "Rolls-Royce", "Phantom", 2019, 65000000, 12000, "Petrol", "Automatic", "Sedan", "Nairobi", "#EC4899",
         "Bespoke two tone paint, starlight roof and a hand stitched cream interior."),
        (dealer1, "BMW", "M3", 2017, 7900000, 38000, "Petrol", "Automatic", "Sedan", "Nairobi", "#EF4444",
         "Competition package, carbon trim and a sports exhaust."),
        (dealer1, "Lamborghini", "Aventador", 2013, 28500000, 21000, "Petrol", "Automatic", "Coupe", "Nairobi", "#F97316",
         "LP700-4 in orange, carbon fibre interior and black forged wheels."),
        (dealer2, "Toyota", "Hilux Rocco", 2019, 5200000, 58000, "Diesel", "Automatic", "Pickup", "Mombasa", "#16A34A",
         "4x4 double cab, Rocco trim, all terrain tyres and leather seats."),
        (dealer2, "Toyota", "Harrier", 2021, 6300000, 27000, "Hybrid", "Automatic", "SUV", "Mombasa", "#0D9488",
         "New shape Harrier with a head up display, powered tailgate and a digital mirror."),
        (dealer2, "Toyota", "GR Supra", 2020, 9800000, 18000, "Petrol", "Automatic", "Coupe", "Mombasa", "#FACC15",
         "3.0 turbo, rear wheel drive, launch control and a rear wing."),
    ]
    cars = []
    for index, row in enumerate(stock):
        cars.append(make_car(row[0], "stock", *row[1:], days_ago=index))

    make_car(seller, "owner", "Volvo", "V40 Cross Country", 2017, 2950000, 54000, "Petrol", "Automatic",
             "Hatchback", "Nairobi", "#8B5CF6", "One careful owner, selling because I am moving abroad.",
             status="approved", days_ago=1)
    make_car(seller, "owner", "BMW", "M4", 2016, 7200000, 47000, "Petrol", "Automatic",
             "Coupe", "Nairobi", "#6366F1", "Matte grey, angel eye lights and gold brake calipers.",
             status="pending", days_ago=0)
    db.session.flush()

    db.session.add(Favorite(user_id=buyer.id, car_id=cars[0].id))
    db.session.add(Favorite(user_id=buyer.id, car_id=cars[2].id))

    request1 = OfferRequest(buyer=buyer, car=cars[0], make="Mercedes-Benz", model="C300",
                            max_budget=4950000, notes="I can pay by bank transfer this week.")
    request2 = OfferRequest(buyer=buyer, make="Toyota", model="Fielder",
                            max_budget=1500000, notes="Looking for a 2014 or newer, automatic.")
    request3 = OfferRequest(buyer=buyer2, make="Subaru", model="Impreza",
                            max_budget=1800000, notes="Nairobi or Nakuru.")
    db.session.add_all([request1, request2, request3])
    db.session.flush()

    db.session.add_all([
        Offer(request_id=request1.id, dealer_id=dealer1.id, price=4850000,
              message="Free first service and a one year warranty."),
        Offer(request_id=request1.id, dealer_id=dealer2.id, price=4900000,
              message="We can deliver to Nairobi at no cost."),
        Offer(request_id=request2.id, dealer_id=dealer2.id, price=1420000,
              message="We have a 2015 Fielder arriving next week."),
    ])

    done = OfferRequest(buyer=buyer2, make="Toyota", model="Axio", max_budget=1100000,
                        notes="Automatic please.", status="closed")
    db.session.add(done)
    db.session.flush()
    db.session.add(Offer(request_id=done.id, dealer_id=dealer2.id, price=1020000,
                         message="Good price, ready for viewing.", status="accepted"))
    db.session.add(Review(buyer_id=buyer2.id, dealer_id=dealer2.id, rating=5,
                          comment="Honest dealer and a smooth process. Highly recommended!"))

    db.session.commit()
    print("Sample data added.")
    print("Log in with password123 and one of these emails:")
    print("  admin@carlens.com  (admin)")
    print("  amina@example.com    (buyer)")
    print("  kevin@example.com    (seller)")
    print("  faith@example.com    (dealer, approved)")
    print("  hassan@example.com   (dealer, approved)")
    print("  grace@example.com    (dealer, waiting for approval)")
