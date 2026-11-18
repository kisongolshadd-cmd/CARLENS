def user_to_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "business_name": user.business_name,
        "location": user.location,
        "dealer_status": user.dealer_status,
        "national_id": user.national_id,
        "has_licence": bool(user.licence_file),
        "email_verified": bool(user.email_verified),
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def dealer_to_dict(user):
    if user is None:
        return None
    return {
        "id": user.id,
        "name": user.name,
        "business_name": user.business_name or user.name,
        "location": user.location,
    }
