import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class NotificationAgent:

    def generate_alerts(self, crisis_data, signal_data, action_plan=None):

        event = crisis_data.get("event", "unknown")
        severity = crisis_data.get("severity", "LOW")

        # ALWAYS use geo-first location
        location = (
            crisis_data.get("location_data", {}).get("location")
            or signal_data.get("location")
            or "Unknown Location"
        )

        alerts = []

        if severity == "HIGH":
            alerts = [
                f"🚨 ALERT: {event} detected in {location}",
                "Emergency response activated",
                "Stay away from affected area"
            ]

        elif severity == "MEDIUM":
            alerts = [
                f"⚠️ WARNING: {event} in {location}",
                "Exercise caution"
            ]

        else:
            alerts = [
                f"ℹ️ Notice: {event} reported in {location}",
                "Monitoring situation"
            ]

        # Email trigger condition
        if event == "flood" or severity == "HIGH":
            self.dispatch_email_alert(event, severity, location, action_plan)

        return {
            "alerts": alerts,
            "channels": {
                "sms": severity != "LOW",
                "app_notification": True,
                "authority_report": severity == "HIGH"
            }
        }

    def dispatch_email_alert(self, event, severity, location, action_plan):

        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")

        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
        except:
            smtp_port = 587

        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        recipient = os.getenv("RECIPIENT_EMAIL")

        # Safety check
        if not smtp_user or not smtp_password or not recipient:
            print("[EMAIL] Missing SMTP configuration in .env")
            return

        safe_event = (event or "UNKNOWN").upper()
        safe_location = (location or "UNKNOWN").upper()

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 CIRO ALERT: {safe_event} in {safe_location}"
        msg["From"] = smtp_user
        msg["To"] = recipient

        html = f"""
        <html>
        <body style="font-family: Arial; background:#0b0f1a; color:white; padding:20px;">
            <h2 style="color:red;">CIRO EMERGENCY ALERT</h2>
            <p><b>Event:</b> {safe_event}</p>
            <p><b>Severity:</b> {severity}</p>
            <p><b>Location:</b> {safe_location}</p>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipient, msg.as_string())
            server.quit()

            print("[EMAIL] Alert sent successfully")

        except Exception as e:
            print("[EMAIL ERROR]", str(e))