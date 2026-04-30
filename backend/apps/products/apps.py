from django.apps import AppConfig


class ProductsConfig(AppConfig):
    name = "apps.products"

    def ready(self):
        import apps.products.signals  # noqa
