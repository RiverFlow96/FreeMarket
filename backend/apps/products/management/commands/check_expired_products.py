from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.products.models import Product, GRACE_PERIOD_HOURS
from apps.users.models import User, NotificationPreference


class Command(BaseCommand):
    help = "Check and process expired products, notify users and delete after grace period"

    def handle(self, *args, **options):
        now = timezone.now()
        grace_delta = timezone.timedelta(hours=GRACE_PERIOD_HOURS)

        expired_products = Product.objects.filter(
            is_active=True,
            expires_at__lt=now
        )

        for product in expired_products:
            product.check_and_expire()
            self.send_expiration_notification(product)

        products_to_delete = Product.objects.filter(
            is_active=False,
            expires_at__lt=now - grace_delta
        )

        deleted_count = products_to_delete.count()
        products_to_delete.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed {expired_products.count()} expired products, "
                f"deleted {deleted_count} products after grace period"
            )
        )

    def send_expiration_notification(self, product):
        user = product.seller
        preference = user.notification_preference

        if preference == NotificationPreference.IN_APP:
            self.send_in_app_notification(user, product)
        elif preference == NotificationPreference.EMAIL:
            self.send_email_notification(user, product)
        elif preference == NotificationPreference.SMS:
            self.send_sms_notification(user, product)
        elif preference == NotificationPreference.BOTH:
            self.send_email_notification(user, product)
            self.send_sms_notification(user, product)

    def send_in_app_notification(self, user, product):
        self.stdout.write(
            f"通知用户 {user.username}: 产品 {product.name} 已过期"
        )

    def send_email_notification(self, user, product):
        if not user.email:
            return
        self.stdout.write(
            f"发送邮件到 {user.email}: 您的产品 {product.name} 已过期，请续期"
        )

    def send_sms_notification(self, user, product):
        if not user.phone:
            return
        self.stdout.write(
            f"发送短信到 {user.phone}: 您的产品 {product.name} 已过期，请在24小时内续期"
        )