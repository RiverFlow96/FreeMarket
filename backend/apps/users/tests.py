import pytest
from django.contrib.auth import get_user_model
from apps.users.models import (
    Plan,
    NotificationPreference,
    PLAN_LIMITS,
    PLAN_PRODUCT_DURATION_WEEKS,
)


@pytest.mark.django_db
class TestUserModel:
    def test_create_user_with_email(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.check_password("testpass123")
        assert not user.is_staff

    def test_create_superuser(self):
        User = get_user_model()
        user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123",
        )
        assert user.is_staff
        assert user.is_superuser

    def test_user_plan_defaults_to_free(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="planuser",
            email="plan@example.com",
            password="pass123",
        )
        assert user.plan == Plan.FREE

    def test_user_plan_can_be_changed(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="planuser",
            email="plan@example.com",
            password="pass123",
        )
        user.plan = Plan.PLUS
        user.save()
        assert user.plan == Plan.PLUS

    def test_product_limit_free_plan(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="freeuser",
            email="free@example.com",
            password="pass123",
        )
        assert user.plan == Plan.FREE
        assert user.product_limit == PLAN_LIMITS[Plan.FREE]

    def test_product_limit_plus_plan(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="plususer",
            email="plus@example.com",
            password="pass123",
            plan=Plan.PLUS,
        )
        assert user.product_limit == PLAN_LIMITS[Plan.PLUS]

    def test_product_limit_pro_plan(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="prouser",
            email="pro@example.com",
            password="pass123",
            plan=Plan.PRO,
        )
        assert user.product_limit == PLAN_LIMITS[Plan.PRO]

    def test_product_count_property(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="countuser",
            email="count@example.com",
            password="pass123",
        )
        assert user.product_count == 0

    def test_can_add_product_true_when_under_limit(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="canadd",
            email="canadd@example.com",
            password="pass123",
        )
        assert user.can_add_product is True

    def test_can_add_product_false_when_at_limit(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="cantadd",
            email="cantadd@example.com",
            password="pass123",
            plan=Plan.FREE,
        )
        for i in range(PLAN_LIMITS[Plan.FREE]):
            from apps.products.models import Product
            from apps.categories.models import Category

            cat, _ = Category.objects.get_or_create(name=f"Cat{i}")
            Product.objects.create(
                name=f"Product {i}",
                price=100,
                seller=user,
                category=cat,
            )
        assert user.can_add_product is False

    def test_product_duration_weeks_free_plan(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="duration",
            email="duration@example.com",
            password="pass123",
        )
        assert user.product_duration_weeks == PLAN_PRODUCT_DURATION_WEEKS[Plan.FREE]

    def test_product_duration_weeks_pro_plan(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="durationpro",
            email="durationpro@example.com",
            password="pass123",
            plan=Plan.PRO,
        )
        assert user.product_duration_weeks == PLAN_PRODUCT_DURATION_WEEKS[Plan.PRO]

    def test_notification_preference_defaults_to_in_app(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="notif",
            email="notif@example.com",
            password="pass123",
        )
        assert user.notification_preference == NotificationPreference.IN_APP

    def test_user_str_representation(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="strtest",
            email="strtest@example.com",
            password="pass123",
        )
        assert str(user) == "strtest"


@pytest.mark.django_db
class TestUserAPI:
    def test_user_registration(self, api_client):
        response = api_client.post(
            "/api/v1/users/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "newpass123",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["success"] is True
        assert response.data["data"]["username"] == "newuser"

    def test_user_profile_get(self, authenticated_client):
        response = authenticated_client.get("/api/v1/users/me/")
        assert response.status_code == 200
        assert response.data["success"] is True
        assert "username" in response.data["data"]

    def test_user_profile_update(self, authenticated_client):
        response = authenticated_client.patch(
            "/api/v1/users/me/",
            {"address": "New Address"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["address"] == "New Address"

    def test_change_password(self, authenticated_client):
        response = authenticated_client.post(
            "/api/v1/users/me/password/",
            {
                "old_password": "testpass123",
                "new_password": "newpass456",
            },
            format="json",
        )
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_change_password_wrong_old(self, authenticated_client):
        response = authenticated_client.post(
            "/api/v1/users/me/password/",
            {
                "old_password": "wrongpass",
                "new_password": "newpass456",
            },
            format="json",
        )
        assert response.status_code == 400
        assert response.data["success"] is False

    def test_update_plan(self, admin_client):
        response = admin_client.post(
            "/api/v1/users/update_plan/",
            {"plan": "plus"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["plan"] == "plus"

    def test_list_users_forbidden_non_admin(self, authenticated_client):
        response = authenticated_client.get("/api/v1/users/")
        assert response.status_code == 403

    def test_list_users_allowed_admin(self, admin_client):
        response = admin_client.get("/api/v1/users/")
        assert response.status_code == 200

    def test_unauthenticated_cannot_access_profile(self, api_client):
        response = api_client.get("/api/v1/users/me/")
        assert response.status_code in [401, 403]
