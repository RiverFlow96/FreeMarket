import pytest
from django.utils import timezone
from datetime import timedelta
from apps.products.models import (
    Product,
    ProductImage,
    PLAN_PRODUCT_DURATION_WEEKS,
)


@pytest.mark.django_db
class TestProductModel:
    def test_create_product(self, user_factory, category_factory):
        seller = user_factory()
        category = category_factory()
        product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            price=100.00,
            currency="CUP",
            seller=seller,
            category=category,
        )
        assert product.name == "Test Product"
        assert product.price == 100.00
        assert product.seller == seller
        assert product.category == category
        assert product.is_active is True

    def test_product_str(self, user_factory, category_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="My Product",
            price=50.00,
            seller=seller,
        )
        assert str(product) == "Producto: My Product"

    def test_product_is_active_by_default(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Active Product",
            price=100.00,
            seller=seller,
        )
        assert product.is_active is True

    def test_product_can_be_deactivated(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Deactivatable Product",
            price=100.00,
            seller=seller,
            is_active=False,
        )
        assert product.is_active is False

    def test_product_expires_at_auto_set_on_creation(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Expiring Product",
            price=100.00,
            seller=seller,
        )
        assert product.expires_at is not None
        expected_weeks = PLAN_PRODUCT_DURATION_WEEKS.get(seller.plan, 1)
        expected_date = timezone.now() + timedelta(weeks=expected_weeks)
        assert abs((product.expires_at - expected_date).total_seconds()) < 60

    def test_product_expires_at_custom(self, user_factory):
        seller = user_factory()
        custom_date = timezone.now() + timedelta(days=30)
        product = Product.objects.create(
            name="Custom Expiry",
            price=100.00,
            seller=seller,
            expires_at=custom_date,
        )
        assert product.expires_at.date() == custom_date.date()

    def test_is_expired_property_when_not_expired(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Fresh Product",
            price=100.00,
            seller=seller,
            is_active=True,
        )
        assert product.is_expired is False

    def test_is_expired_property_when_inactive(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Inactive Product",
            price=100.00,
            seller=seller,
            is_active=False,
        )
        assert product.is_expired is True

    def test_is_expired_property_when_past_expiry(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Past Product",
            price=100.00,
            seller=seller,
            is_active=True,
            expires_at=timezone.now() - timedelta(days=1),
        )
        assert product.is_expired is True

    def test_display_image_with_uploaded_image(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Image Product",
            price=100.00,
            seller=seller,
            image_url="https://example.com/image.jpg",
        )
        assert product.display_image == "https://example.com/image.jpg"

    def test_check_and_expire_method(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="To Expire",
            price=100.00,
            seller=seller,
            is_active=True,
            expires_at=timezone.now() - timedelta(days=1),
        )
        result = product.check_and_expire()
        assert result is True
        product.refresh_from_db()
        assert product.is_active is False

    def test_check_and_expire_method_no_expiry_needed(self, user_factory):
        seller = user_factory()
        product = Product.objects.create(
            name="Not To Expire",
            price=100.00,
            seller=seller,
            is_active=True,
            expires_at=timezone.now() + timedelta(days=30),
        )
        result = product.check_and_expire()
        assert result is False
        product.refresh_from_db()
        assert product.is_active is True


@pytest.mark.django_db
class TestProductImageModel:
    def test_create_product_image(self, product_factory):
        product = product_factory()
        image = ProductImage.objects.create(
            product=product,
            image="test.jpg",
        )
        assert image.product == product
        assert str(image) == f"Imagen de {product.name}"

    def test_product_images_relationship(self, product_factory):
        product = product_factory()
        ProductImage.objects.create(product=product, image="img1.jpg")
        ProductImage.objects.create(product=product, image="img2.jpg")
        ProductImage.objects.create(product=product, image="img3.jpg")
        assert product.images.count() == 3


@pytest.mark.django_db
class TestProductAPI:
    def test_list_products_public(self, api_client, product_factory):
        product_factory(name="Public Product")
        response = api_client.get("/api/v1/products/")
        assert response.status_code == 200
        assert response.data["success"] is True
        assert len(response.data["data"]) >= 1

    def test_list_products_with_pagination(self, api_client, product_factory):
        for i in range(5):
            product_factory(name=f"Product {i}")
        response = api_client.get("/api/v1/products/?page=1&page_size=2")
        assert response.status_code == 200
        assert len(response.data["data"]) == 2
        assert response.data["pagination"]["total"] == 5

    def test_search_products(self, api_client, product_factory):
        product_factory(name="iPhone 15 Pro")
        product_factory(name="Samsung Galaxy S24")
        response = api_client.get("/api/v1/products/?search=iPhone")
        assert response.status_code == 200
        assert "iPhone" in response.data["data"][0]["name"]

    def test_filter_by_category(self, api_client, product_factory, category_factory):
        cat = category_factory(name="Electronics")
        product_factory(name="Laptop", category=cat)
        product_factory(name="Phone")
        response = api_client.get("/api/v1/products/?category=Electronics")
        assert response.status_code == 200
        assert all(p["category_name"] == "Electronics" for p in response.data["data"])

    def test_create_product_authenticated(self, authenticated_client, category_factory):
        cat = category_factory()
        response = authenticated_client.post(
            "/api/v1/products/",
            {
                "name": "New Product",
                "price": 150.00,
                "currency": "CUP",
                "category": cat.id,
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["success"] is True
        assert response.data["data"]["name"] == "New Product"

    def test_create_product_unauthenticated_forbidden(self, api_client):
        response = api_client.post(
            "/api/v1/products/",
            {"name": "Bad Product", "price": 100.00},
            format="json",
        )
        assert response.status_code in [401, 403]

    def test_update_own_product(self, authenticated_client, product_factory):
        product = product_factory(seller=authenticated_client.user)
        response = authenticated_client.patch(
            f"/api/v1/products/{product.id}/",
            {"name": "Updated Name"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["data"]["name"] == "Updated Name"

    def test_update_other_product_forbidden(
        self, authenticated_client, product_factory
    ):
        product = product_factory()
        response = authenticated_client.patch(
            f"/api/v1/products/{product.id}/",
            {"name": "Hacked Name"},
            format="json",
        )
        assert response.status_code == 403

    def test_delete_own_product(self, authenticated_client, product_factory):
        product = product_factory(seller=authenticated_client.user)
        response = authenticated_client.delete(f"/api/v1/products/{product.id}/")
        assert response.status_code == 204

    def test_delete_other_product_forbidden(
        self, authenticated_client, product_factory
    ):
        product = product_factory()
        response = authenticated_client.delete(f"/api/v1/products/{product.id}/")
        assert response.status_code == 403

    def test_product_sort_by_price_asc(self, api_client, product_factory):
        product_factory(name="Cheap", price=50.00)
        product_factory(name="Expensive", price=500.00)
        response = api_client.get("/api/v1/products/?sort=price_asc")
        assert response.status_code == 200
        assert response.data["data"][0]["price"] == "50.00"

    def test_product_sort_by_price_desc(self, api_client, product_factory):
        product_factory(name="Cheap", price=50.00)
        product_factory(name="Expensive", price=500.00)
        response = api_client.get("/api/v1/products/?sort=price_desc")
        assert response.status_code == 200
        assert response.data["data"][0]["price"] == "500.00"

    def test_price_range_filter(self, api_client, product_factory):
        product_factory(name="Low Price", price=50.00)
        product_factory(name="High Price", price=500.00)
        response = api_client.get("/api/v1/products/?min_price=100&max_price=600")
        assert response.status_code == 200
        assert all(float(p["price"]) >= 100 for p in response.data["data"])
