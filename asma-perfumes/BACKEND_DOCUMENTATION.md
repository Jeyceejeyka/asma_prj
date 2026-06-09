# ASMA Perfumes — Backend API Documentation

This document describes every REST API endpoint the frontend expects, the complete JWT authentication system, access control policies, database models, deployment notes, and a full directory of all frontend views/pages.

---

## Table of Contents

1. [Authentication Overview](#1-authentication-overview)
2. [JWT Token Lifecycle](#2-jwt-token-lifecycle)
3. [Django Backend Setup Guide](#3-django-backend-setup-guide)
4. [Access Control — Public vs Protected](#4-access-control--public-vs-protected)
5. [User vs Admin Roles](#5-user-vs-admin-roles)
6. [All API Endpoints](#6-all-api-endpoints)
7. [Database Models](#7-database-models)
8. [Environment Variables](#8-environment-variables)
9. [Local Development Setup](#9-local-development-setup)
10. [Production Deployment](#10-production-deployment)
11. [Security Checklist](#11-security-checklist)
12. [Frontend Views / Pages Directory](#12-frontend-views--pages-directory)
13. [Frontend Components Directory](#13-frontend-components-directory)

---

## 1. Authentication Overview

The application uses **JWT (JSON Web Tokens)** via **djangorestframework-simplejwt** for stateless authentication.

### How It Works

1. User registers or logs in → backend returns an **access token** (short-lived) and a **refresh token** (long-lived)
2. Frontend stores both tokens in `localStorage` and includes the access token in the `Authorization: Bearer <token>` header for all protected API calls
3. When the access token expires, the frontend sends the refresh token to get a new access token
4. On logout, the refresh token is **blacklisted** on the server so it can't be reused

### Frontend Auth Store (`src/store/authStore.ts`)

The frontend manages auth state via Zustand with:
- `login(email, password)` → calls `POST /api/auth/login/`
- `register(data)` → calls `POST /api/auth/register/`
- `logout()` → calls `POST /api/auth/logout/` and clears local storage
- `refreshAccessToken()` → calls `POST /api/auth/refresh/`
- Token + user data persisted to `localStorage`

### Frontend Auth Guard (`src/components/AuthGuard.tsx`)

A route wrapper that:
- Redirects unauthenticated users to `/login`
- Optionally requires `admin` role via `requireAdmin` prop
- Shows a toast notification when access is denied

---

## 2. JWT Token Lifecycle

```
┌──────────────┐     POST /api/auth/login/      ┌──────────────┐
│   Frontend   │ ──────────────────────────────► │   Backend    │
│              │ ◄────────────────────────────── │              │
│              │   { access, refresh, user }     │              │
└──────┬───────┘                                 └──────────────┘
       │
       │  access token in Authorization header
       │  for all protected requests
       │
       ▼
┌──────────────┐     POST /api/auth/refresh/     ┌──────────────┐
│  Token       │ ──────────────────────────────► │   Backend    │
│  Expired?    │ ◄────────────────────────────── │              │
│              │   { access (new) }              │              │
└──────┬───────┘                                 └──────────────┘
       │
       │  POST /api/auth/logout/
       │  { refresh } → blacklisted
       ▼
┌──────────────┐
│  Logged Out  │  localStorage cleared
└──────────────┘
```

**Token Lifetimes (recommended):**
| Token | Development | Production |
|-------|------------|------------|
| Access Token | 30 minutes | 15 minutes |
| Refresh Token | 7 days | 7 days |

---

## 3. Django Backend Setup Guide

### Step 1: Install Dependencies

```bash
pip install djangorestframework djangorestframework-simplejwt django-cors-headers django-filter
```

### Step 2: Configure `settings.py`

```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # Required for logout
    'corsheaders',
    'django_filters',
    # your apps
    'accounts',
    'products',
    'orders',
    'payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 30))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# CORS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',')

AUTH_USER_MODEL = 'accounts.User'
```

### Step 3: Create Custom User Model (`accounts/models.py`)

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

### Step 4: Create Auth Serializers (`accounts/serializers.py`)

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_staff')
        read_only_fields = ('id', 'is_staff')

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
```

### Step 5: Create Auth Views (`accounts/views.py`)

```python
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer, LoginSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
```

### Step 6: Auth URLs (`accounts/urls.py`)

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', ProfileView.as_view(), name='profile'),
]
```

### Step 7: Main URLs (`project/urls.py`)

```python
from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('payments.urls')),
    path('api/admin/', include('analytics.urls')),
]
```

### Step 8: Custom Permissions (`core/permissions.py`)

```python
from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """Only allows access to users with is_staff=True."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff
```

---

## 4. Access Control — Public vs Protected

### Public Routes (No Authentication Required)

| Frontend Route | API Endpoint | Description |
|---------------|--------------|-------------|
| `/` | — (static data) | Home/landing page |
| `/collections/:id` | `GET /api/collections/`, `GET /api/products/?collection=X` | Browse collections and products |
| `/about` | — (static data) | About page |
| `/search?q=` | `GET /api/products/?search=X` | Search products |
| `/login` | `POST /api/auth/login/` | Login page |
| `/register` | `POST /api/auth/register/` | Registration page |

### Protected Routes (Authentication Required)

| Frontend Route | API Endpoint | Auth Level | Description |
|---------------|--------------|------------|-------------|
| `/product/:id` | `GET /api/products/{id}/` | User | Product detail page |
| `/wishlist` | `GET /api/wishlist/` | User | User's wishlist |
| `/checkout` | `POST /api/orders/`, `POST /api/payments/mpesa/stk-push/` | User | Checkout flow |
| `/admin` | `GET /api/admin/dashboard/` | Admin (`is_staff`) | Admin dashboard |

### Protected Actions (on public pages)

| Action | API Endpoint | Auth Level | Behavior if Unauthenticated |
|--------|-------------|------------|----------------------------|
| Add to cart | `POST /api/cart/items/` | User | Redirects to `/login` with toast |
| Toggle wishlist | `POST /api/wishlist/toggle/` | User | Redirects to `/login` with toast |

---

## 5. User vs Admin Roles

### How Roles Are Defined

Roles are determined by the `is_staff` field on the Django `User` model:

| Field | Value | Role | Access |
|-------|-------|------|--------|
| `is_staff` | `False` | Regular User | Browse, purchase, manage wishlist/cart |
| `is_staff` | `True` | Admin | Everything above + admin dashboard, product CRUD, order management, analytics |

### How Roles Are Enforced

**Backend (Django):**
```python
# Regular authenticated users
permission_classes = [permissions.IsAuthenticated]

# Admin-only endpoints
from core.permissions import IsAdminUser
permission_classes = [IsAdminUser]

# Public endpoints
permission_classes = [permissions.AllowAny]
```

**Frontend (React):**
```tsx
// Protected route (any authenticated user)
<AuthGuard><ProductDetail /></AuthGuard>

// Admin-only route
<AuthGuard requireAdmin><Admin /></AuthGuard>
```

### Creating an Admin User

```bash
python manage.py createsuperuser
# Or programmatically:
# User.objects.create_superuser(email='admin@asma.com', password='...', first_name='Admin', last_name='User')
```

---

## 6. All API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | Public | Register new user → returns JWT tokens + user |
| POST | `/api/auth/login/` | Public | Login → returns JWT tokens + user |
| POST | `/api/auth/refresh/` | Public | Refresh access token using refresh token |
| POST | `/api/auth/logout/` | User | Blacklist refresh token |
| GET | `/api/auth/me/` | User | Get current user profile |
| PATCH | `/api/auth/me/` | User | Update current user profile |
| POST | `/api/auth/password-reset/` | Public | Request password reset email |
| POST | `/api/auth/password-reset-confirm/` | Public | Confirm password reset |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products/` | Public | List all products (filtering, pagination, search) |
| GET | `/api/products/{id}/` | User | Get single product detail |
| POST | `/api/products/` | Admin | Create product |
| PUT | `/api/products/{id}/` | Admin | Update product |
| PATCH | `/api/products/{id}/` | Admin | Partial update product |
| DELETE | `/api/products/{id}/` | Admin | Delete product |
| POST | `/api/products/{id}/upload-image/` | Admin | Upload product image |

**Query Parameters for `GET /api/products/`:**
- `collection` — filter by collection name
- `grade` — filter by grade (Parfum, EDP, EDT, EDC, Extrait)
- `season` — filter by season
- `gender` — filter by gender
- `min_price` / `max_price` — price range
- `search` — full-text search (name, notes, description)
- `ordering` — sort field (price, -price, name, rating)
- `page` / `page_size` — pagination

### Collections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/collections/` | Public | List all collections |
| GET | `/api/collections/{slug}/` | Public | Get single collection with its products |
| POST | `/api/collections/` | Admin | Create collection |
| PUT | `/api/collections/{slug}/` | Admin | Update collection |
| DELETE | `/api/collections/{slug}/` | Admin | Delete collection |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart/` | User | Get current user's cart |
| POST | `/api/cart/items/` | User | Add item to cart |
| PATCH | `/api/cart/items/{id}/` | User | Update cart item quantity |
| DELETE | `/api/cart/items/{id}/` | User | Remove item from cart |
| DELETE | `/api/cart/clear/` | User | Clear entire cart |

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist/` | User | Get user's wishlist product IDs |
| POST | `/api/wishlist/` | User | Add product to wishlist |
| DELETE | `/api/wishlist/{product_id}/` | User | Remove product from wishlist |
| POST | `/api/wishlist/toggle/` | User | Toggle wishlist (add/remove) |

### Orders & Checkout

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/` | User | Create order from cart |
| GET | `/api/orders/` | User | List user's orders |
| GET | `/api/orders/{id}/` | User | Get order details |
| PATCH | `/api/orders/{id}/status/` | Admin | Update order status |
| GET | `/api/orders/{id}/track/` | User | Track order |

**Order Statuses:** `pending` → `confirmed` → `processing` → `shipped` → `delivered` | `cancelled` | `refunded`

### M-Pesa Integration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/mpesa/stk-push/` | User | Initiate STK Push |
| POST | `/api/payments/mpesa/callback/` | Public (webhook) | M-Pesa callback from Safaricom |
| GET | `/api/payments/mpesa/status/{checkout_request_id}/` | User | Check payment status |

### Admin / Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard/` | Admin | Dashboard stats (totals, trends) |
| GET | `/api/admin/orders/` | Admin | All orders with filters |
| PATCH | `/api/admin/orders/{id}/` | Admin | Update order status |
| GET | `/api/admin/customers/` | Admin | List all customers |
| GET | `/api/admin/customers/{id}/` | Admin | Customer detail + order history |
| GET | `/api/admin/products/` | Admin | All products (admin view with stock) |
| GET | `/api/admin/analytics/revenue/` | Admin | Revenue data (daily/weekly/monthly) |
| GET | `/api/admin/analytics/top-products/` | Admin | Top selling products |
| GET | `/api/admin/analytics/order-status/` | Admin | Order status distribution |
| GET | `/api/admin/analytics/collection-sales/` | Admin | Sales breakdown by collection |
| GET | `/api/admin/analytics/customer-growth/` | Admin | New customers over time |

---

## 7. Database Models

### User (extends Django AbstractUser)
```python
class User(AbstractUser):
    email = EmailField(unique=True)
    phone = CharField(max_length=15, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

### Product
```python
class Product(models.Model):
    GRADE_CHOICES = [
        ('Parfum', 'Parfum'), ('Eau de Parfum', 'Eau de Parfum'),
        ('Eau de Toilette', 'Eau de Toilette'), ('Eau de Cologne', 'Eau de Cologne'),
        ('Extrait', 'Extrait'),
    ]
    SILLAGE_CHOICES = [('Intimate','Intimate'), ('Moderate','Moderate'), ('Strong','Strong'), ('Enormous','Enormous')]
    LONGEVITY_CHOICES = [
        ('2-4 hours','2-4 hours'), ('4-6 hours','4-6 hours'), ('6-8 hours','6-8 hours'),
        ('8-12 hours','8-12 hours'), ('12+ hours','12+ hours'),
    ]
    SEASON_CHOICES = [
        ('Spring','Spring'), ('Summer','Summer'), ('Autumn','Autumn'),
        ('Winter','Winter'), ('All Seasons','All Seasons'),
    ]
    GENDER_CHOICES = [('Unisex','Unisex'), ('Masculine','Masculine'), ('Feminine','Feminine')]

    name = CharField(max_length=200)
    collection = ForeignKey('Collection', on_delete=CASCADE, related_name='products')
    price = DecimalField(max_digits=10, decimal_places=2)
    sizes = JSONField(default=list)
    notes_top = CharField(max_length=300)     # For search/filtering
    notes_heart = CharField(max_length=300)   # For search/filtering
    notes_base = CharField(max_length=300)    # For search/filtering
    description = TextField()
    image = ImageField(upload_to='products/')
    grade = CharField(max_length=20, choices=GRADE_CHOICES)
    rating = IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    concentration = CharField(max_length=20)
    longevity = CharField(max_length=20, choices=LONGEVITY_CHOICES)
    sillage = CharField(max_length=20, choices=SILLAGE_CHOICES)
    season = CharField(max_length=20, choices=SEASON_CHOICES)
    gender = CharField(max_length=20, choices=GENDER_CHOICES)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### Collection
```python
class Collection(models.Model):
    name = CharField(max_length=200, unique=True)
    slug = SlugField(unique=True)
    tagline = CharField(max_length=300)
    description = TextField()
    image = ImageField(upload_to='collections/')
    is_active = BooleanField(default=True)
```

### Order
```python
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending','Pending'), ('confirmed','Confirmed'), ('processing','Processing'),
        ('shipped','Shipped'), ('delivered','Delivered'), ('cancelled','Cancelled'), ('refunded','Refunded'),
    ]
    PAYMENT_CHOICES = [('mpesa','M-Pesa'), ('card','Card'), ('cod','Cash on Delivery')]

    order_number = CharField(max_length=30, unique=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='orders')
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_status = CharField(max_length=20, default='pending')
    subtotal = DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = DecimalField(max_digits=10, decimal_places=2, default=0)
    total = DecimalField(max_digits=10, decimal_places=2)
    notes = TextField(blank=True)
    shipping_first_name = CharField(max_length=100)
    shipping_last_name = CharField(max_length=100)
    shipping_email = EmailField()
    shipping_phone = CharField(max_length=15)
    shipping_address = TextField()
    shipping_city = CharField(max_length=100)
    shipping_postal_code = CharField(max_length=20)
    shipping_country = CharField(max_length=5, default='KE')
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### OrderItem
```python
class OrderItem(models.Model):
    order = ForeignKey(Order, on_delete=CASCADE, related_name='items')
    product = ForeignKey(Product, on_delete=PROTECT)
    size = CharField(max_length=20)
    quantity = PositiveIntegerField()
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    subtotal = DecimalField(max_digits=10, decimal_places=2)
```

### Cart / CartItem
```python
class Cart(models.Model):
    user = OneToOneField(User, on_delete=CASCADE, related_name='cart')
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = ForeignKey(Cart, on_delete=CASCADE, related_name='items')
    product = ForeignKey(Product, on_delete=CASCADE)
    size = CharField(max_length=20)
    quantity = PositiveIntegerField(default=1)
    class Meta:
        unique_together = ('cart', 'product', 'size')
```

### Wishlist
```python
class WishlistItem(models.Model):
    user = ForeignKey(User, on_delete=CASCADE, related_name='wishlist')
    product = ForeignKey(Product, on_delete=CASCADE)
    created_at = DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'product')
```

### MpesaTransaction
```python
class MpesaTransaction(models.Model):
    order = ForeignKey(Order, on_delete=CASCADE, related_name='mpesa_transactions')
    checkout_request_id = CharField(max_length=100, unique=True)
    merchant_request_id = CharField(max_length=100)
    phone_number = CharField(max_length=15)
    amount = DecimalField(max_digits=10, decimal_places=2)
    mpesa_receipt = CharField(max_length=50, blank=True)
    result_code = IntegerField(null=True)
    result_desc = TextField(blank=True)
    status = CharField(max_length=20, default='pending')
    created_at = DateTimeField(auto_now_add=True)
```

---

## 8. Environment Variables

### Local Development (.env)
```
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:pass@localhost:5432/asma_db
CORS_ALLOWED_ORIGINS=http://localhost:5173

# JWT
JWT_ACCESS_TOKEN_LIFETIME=30
JWT_REFRESH_TOKEN_LIFETIME=7

# M-Pesa Sandbox
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_sandbox_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback/

# Media
MEDIA_URL=/media/
MEDIA_ROOT=media/
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production (.env.production)
```
SECRET_KEY=strong-random-secret-key
DEBUG=False
ALLOWED_HOSTS=api.asmaperfumes.com
DATABASE_URL=postgres://user:pass@db-host:5432/asma_production
CORS_ALLOWED_ORIGINS=https://asmaperfumes.com

# JWT (shorter access for production security)
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7

# M-Pesa Production
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_SHORTCODE=your_paybill_number
MPESA_PASSKEY=your_production_passkey
MPESA_CALLBACK_URL=https://api.asmaperfumes.com/api/payments/mpesa/callback/

# Media (S3 or similar)
AWS_STORAGE_BUCKET_NAME=asma-media
AWS_S3_REGION_NAME=af-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## 9. Local Development Setup

```bash
# 1. Clone and set up
git clone <repo-url>
cd asma-backend
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file (see section 8)
cp .env.example .env

# 4. Database
createdb asma_db
python manage.py migrate

# 5. Create admin user
python manage.py createsuperuser

# 6. Load sample data (optional)
python manage.py loaddata fixtures/products.json

# 7. Run server
python manage.py runserver

# 8. For M-Pesa testing, expose callback via ngrok
ngrok http 8000
```

### Required Python Packages (requirements.txt)
```
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
django-filter>=23.5
Pillow>=10.0
psycopg2-binary>=2.9
python-decouple>=3.8
requests>=2.31
gunicorn>=21.2
whitenoise>=6.5
boto3>=1.34
```

### Testing Authentication Locally

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'

# Access protected endpoint
curl http://localhost:8000/api/products/1/ \
  -H "Authorization: Bearer <access_token>"

# Refresh token
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<refresh_token>"}'

# Logout
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<refresh_token>"}'
```

---

## 10. Production Deployment

### Recommended Stack
- **Server**: Ubuntu 22.04 on AWS EC2 / DigitalOcean / Railway
- **Web Server**: Nginx → Gunicorn → Django
- **Database**: PostgreSQL 15+
- **Media Storage**: AWS S3 / Cloudflare R2
- **SSL**: Let's Encrypt / Cloudflare
- **CI/CD**: GitHub Actions

### Production Security Settings (`settings.py`)
```python
# HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Security headers
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Shorter token lifetime in production
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=15)
```

### Deployment Steps
```bash
# 1. Set up server
sudo apt update && sudo apt upgrade
sudo apt install python3-pip python3-venv nginx postgresql

# 2. Clone and configure
git clone <repo-url> /opt/asma-backend
cd /opt/asma-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Set environment variables

# 4. Database
sudo -u postgres createdb asma_production
python manage.py migrate
python manage.py collectstatic --noinput

# 5. Gunicorn service
# Create /etc/systemd/system/asma.service

# 6. Nginx config + HTTPS with certbot

# 7. Start services
sudo systemctl enable asma && sudo systemctl start asma
sudo systemctl restart nginx
```

---

## 11. Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong, unique `SECRET_KEY`
- [ ] HTTPS enforced (`SECURE_SSL_REDIRECT=True`)
- [ ] CORS restricted to frontend domain only
- [ ] JWT tokens have short expiry (15 min access, 7 day refresh)
- [ ] Refresh token blacklisting enabled
- [ ] M-Pesa callback validates Safaricom IP ranges
- [ ] All admin endpoints require `is_staff=True`
- [ ] Rate limiting on auth endpoints (django-ratelimit)
- [ ] Input validation on all serializers
- [ ] SQL injection protection (use ORM, never raw SQL)
- [ ] File upload validation (type, size limits)
- [ ] CSRF protection enabled for session-based views
- [ ] Security headers (X-Frame-Options, Content-Security-Policy, etc.)
- [ ] Database backups automated (daily)
- [ ] Logging and monitoring (Sentry recommended)
- [ ] No secrets in version control (use .env, never commit)
- [ ] Password hashing via Django's PBKDF2 (default, no config needed)
- [ ] Leaked password checking (optional: django-pwned-passwords)

---

## 12. Frontend Views / Pages Directory

All frontend views are React components rendered via React Router.

| Route | Component | File | Auth Required | Description |
|-------|-----------|------|---------------|-------------|
| `/` | `Index` | `src/pages/Index.tsx` | **No** | Landing page — hero banner, collections grid, scent quiz, product grid, brand story, social proof, footer |
| `/collections/:id` | `CollectionPage` | `src/pages/CollectionPage.tsx` | **No** | All products within a collection with filters (grade, season, gender) |
| `/about` | `About` | `src/pages/About.tsx` | **No** | Brand story, mission, and company info |
| `/search?q=` | `SearchResults` | `src/pages/SearchResults.tsx` | **No** | Debounced search results filtered by name, collection, notes, grade, season |
| `/login` | `Login` | `src/pages/Login.tsx` | **No** | Login form with email/password, redirects to previous page on success |
| `/register` | `Register` | `src/pages/Register.tsx` | **No** | Registration form with name, email, password + confirmation |
| `/product/:id` | `ProductDetail` | `src/pages/ProductDetail.tsx` | **Yes (User)** | Full product detail — image, specs, size selector, add-to-cart, wishlist, pair suggestion |
| `/wishlist` | `Wishlist` | `src/pages/Wishlist.tsx` | **Yes (User)** | User's wishlisted products grid |
| `/checkout` | `Checkout` | `src/pages/Checkout.tsx` | **Yes (User)** | 4-step checkout: cart review → details → M-Pesa payment → confirmation |
| `/admin` | `Admin` | `src/pages/Admin.tsx` | **Yes (Admin)** | Dashboard with charts, product CRUD, orders, customers |
| `*` | `NotFound` | `src/pages/NotFound.tsx` | **No** | 404 page |

---

## 13. Frontend Components Directory

### Always-Rendered (Layout)

| Component | File | Description |
|-----------|------|-------------|
| `Navbar` | `src/components/Navbar.tsx` | Top nav with logo, links, search, cart badge, wishlist icon, auth (Sign In/Sign Out), theme toggle |
| `CartDrawer` | `src/components/CartDrawer.tsx` | Slide-out cart panel with items, totals, checkout link |
| `PageTransition` | `src/components/PageTransition.tsx` | Framer Motion enter/exit animation wrapper |
| `AuthGuard` | `src/components/AuthGuard.tsx` | Route protection — redirects unauthenticated users to `/login`, supports `requireAdmin` prop |

### Reusable Components

| Component | File | Description |
|-----------|------|-------------|
| `ProductCard` | `src/components/ProductCard.tsx` | Product card with image, grade badge, star rating, hover details, add-to-cart (auth-gated), wishlist heart, Schema.org microdata |
| `ProductGrid` | `src/components/ProductGrid.tsx` | Responsive product grid with integrated search |
| `ProductSearch` | `src/components/ProductSearch.tsx` | Debounced search input for filtering products |
| `Hero` | `src/components/Hero.tsx` | Animated hero banner |
| `CollectionsSection` | `src/components/CollectionsSection.tsx` | Grid of collection cards |
| `ScentQuiz` | `src/components/ScentQuiz.tsx` | Interactive fragrance recommendation quiz |
| `BrandStory` | `src/components/BrandStory.tsx` | Brand narrative section |
| `SocialProof` | `src/components/SocialProof.tsx` | Testimonials section |
| `Footer` | `src/components/Footer.tsx` | Site footer |
| `ThemeToggle` | `src/components/ThemeToggle.tsx` | Light/dark mode toggle |
| `GoldParticles` | `src/components/GoldParticles.tsx` | Decorative particle animation |

### State Management

| Store | File | Description |
|-------|------|-------------|
| `useAuthStore` | `src/store/authStore.ts` | JWT auth state — login, register, logout, token refresh, user data |
| `useCartStore` | `src/store/cartStore.ts` | Shopping cart — add/remove items, quantities, totals, localStorage persistence |
| `useWishlistStore` | `src/store/wishlistStore.ts` | Wishlist — toggle product IDs, localStorage persistence |
