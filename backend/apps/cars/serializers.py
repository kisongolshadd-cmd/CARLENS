from apps.accounts.serializers import dealer_to_dict


def car_to_dict(car, favorite_ids=None):
    return {
        "id": car.id,
        "kind": car.kind,
        "make": car.make,
        "model": car.model,
        "year": car.year,
        "price": car.price,
        "mileage": car.mileage,
        "fuel": car.fuel,
        "transmission": car.transmission,
        "body_type": car.body_type,
        "location": car.location,
        "color": car.color,
        "description": car.description,
        "image_url": car.image_url,
        "images": ([car.image_url] if car.image_url else []) + [u for u in (car.gallery or "").split("\n") if u],
        "status": car.status,
        "reject_reason": car.reject_reason,
        "created_at": car.created_at.isoformat() if car.created_at else None,
        "owner": dealer_to_dict(car.owner),
        "is_favorite": (car.id in favorite_ids) if favorite_ids is not None else False,
    }
