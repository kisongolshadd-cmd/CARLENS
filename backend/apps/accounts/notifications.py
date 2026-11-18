from config.extensions import db
from apps.accounts.models import Notification, User


def notify(user_id, text, link=None):
    if user_id:
        db.session.add(Notification(user_id=user_id, text=text[:255], link=link))


def notify_admins(text, link=None):
    for admin in User.query.filter_by(role="admin").all():
        notify(admin.id, text, link)
