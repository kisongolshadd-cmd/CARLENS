from flask import jsonify


def error(message, code=400):
    return jsonify(error=message), code


def to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
