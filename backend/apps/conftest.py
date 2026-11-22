from itertools import count

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.categories.models import Category
from apps.products.models import Product


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_factory(db):
    sequence = count()

    def create_user(**kwargs):
        unique_id = next(sequence)
        defaults = {
            "username": f"testuser-{unique_id}",
            "email": f"test-{unique_id}@example.com",
            "password": "testpass123",
        }
        defaults.update(kwargs)
        user = get_user_model().objects.create_user(**defaults)
        return user

    return create_user


@pytest.fixture
def authenticated_client(db, user_factory):
    user = user_factory(username="authuser", email="auth@example.com")
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    client.user = user
    return client


@pytest.fixture
def admin_user(db):
    User = get_user_model()
    admin = User.objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password="adminpass123",
    )
    return admin


@pytest.fixture
def admin_client(db, admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    client.user = admin_user
    return client


@pytest.fixture
def category_factory(db):
    def create_category(name="Test Category"):
        return Category.objects.create(name=name)

    return create_category


@pytest.fixture
def product_factory(db, user_factory, category_factory):
    def create_product(
        name="Test Product",
        price=100.00,
        currency="CUP",
        seller=None,
        category=None,
        **kwargs,
    ):
        if seller is None:
            seller = user_factory()
        if category is None:
            category = category_factory()
        return Product.objects.create(
            name=name,
            price=price,
            currency=currency,
            seller=seller,
            category=category,
            **kwargs,
        )

    return create_product
