import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail

print("Sending test email...")

try:
    result = send_mail(
        subject='Test Email from Cooking with Chris',
        message='This is a test email. If you receive this, SendGrid is working!',
        from_email=None,
        recipient_list=['cpage82@gmail.com'],
        fail_silently=False,
    )
    print(f"SUCCESS! Email sent. Result: {result}")
    print("Check output above to see the email content")
except Exception as e:
    print(f"ERROR sending email: {e}")
