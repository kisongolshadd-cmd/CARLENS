import smtplib
from email.message import EmailMessage

from flask import current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


def make_token(data, purpose):
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=purpose).dumps(data)


def read_token(token, purpose, max_age):
    try:
        return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=purpose).loads(token, max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None


def mail_is_set_up():
    return bool(current_app.config["MAIL_HOST"])


def send_email(to, subject, text):
    config = current_app.config
    if not mail_is_set_up():
        print(f"\n[email not set up] To: {to}\nSubject: {subject}\n{text}\n")
        return
    message = EmailMessage()
    message["From"] = config["MAIL_FROM"]
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    try:
        with smtplib.SMTP(config["MAIL_HOST"], config["MAIL_PORT"], timeout=15) as server:
            server.starttls()
            if config["MAIL_USER"]:
                server.login(config["MAIL_USER"], config["MAIL_PASSWORD"])
            server.send_message(message)
    except Exception as problem:
        print("Could not send email:", problem)


def link_for(path, token):
    return f"{current_app.config['FRONTEND_URL']}{path}?token={token}"


def show_link_in_dev(link):
    import os
    if mail_is_set_up() or os.getenv("APP_ENV") == "production":
        return {}
    return {"dev_link": link}


def send_verify_email(user):
    link = link_for("/verify-email", make_token(user.id, "verify"))
    send_email(user.email, "Verify your CarLens email",
               f"Hi {user.name},\n\nOpen this link to verify your email:\n{link}\n\nThe link works for 3 days.")
    return show_link_in_dev(link)


def send_reset_email(user):
    link = link_for("/reset-password", make_token([user.id, user.password_hash[-10:]], "reset"))
    send_email(user.email, "Reset your CarLens password",
               f"Hi {user.name},\n\nOpen this link to choose a new password:\n{link}\n\nThe link works for 1 hour. If you did not ask for this, ignore this email.")
    return show_link_in_dev(link)
