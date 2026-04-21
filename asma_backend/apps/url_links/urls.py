# urls.py for url_links app
from django.urls import path
from apps.url_links.views import list_urls

urlpatterns = [
    path('list/', list_urls, name='list_urls'),
]
