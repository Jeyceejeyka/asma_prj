from threading import Barrier, Thread
from queue import Queue

from django.contrib.auth import get_user_model
from django.test import Client, TransactionTestCase
from django.urls import reverse

from apps.cart.models import CartItem
from apps.products.models import Category, Product


class CartAddViewTests(TransactionTestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="tester",
            email="tester@example.com",
            password="secret123",
        )
        self.category = Category.objects.create(category_name="Perfume")
        self.product = Product.objects.create(
            product_name="Velvet Oud",
            description="A rich fragrance",
            price="120.00",
            stock_quantity=10,
            category=self.category,
        )

    def test_concurrent_add_creates_only_one_cart_item(self):
        url = reverse("cart-add-item")
        payload = {"product_id": self.product.id, "quantity": 1}
        results: Queue[int] = Queue()
        barrier = Barrier(2)

        def post_add():
            barrier.wait()
            client = Client()
            client.force_login(self.user)
            response = client.post(url, payload, content_type="application/json")
            results.put(response.status_code)

        threads = [Thread(target=post_add) for _ in range(2)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        self.assertEqual(results.qsize(), 2)
        self.assertEqual(
            CartItem.objects.filter(cart=self.user.cart, products=self.product).count(),
            1,
        )
        self.assertEqual(sorted(results.queue), [200, 200])
