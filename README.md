# ASMA E-Commerce Backend

## Overview
ASMA is a modular Django REST Framework (DRF) backend for a modern e-commerce platform, supporting user authentication, product management, cart, orders, and Safaricom Daraja (M-Pesa) payment integration. The project is production-ready, secure, and extensible.

---

## Features
- **User Registration & Authentication**: JWT-based, with password reset and change support.
- **Product Catalog**: CRUD for products and categories, with admin and public endpoints.
- **Cart**: Add, update, remove, and clear items; checkout flow.
- **Orders**: User and admin order management, order items, and status tracking.
- **Payments**: Safaricom Daraja STK push, callback handling, and transaction audit.
- **Admin Panel**: Django admin for all models.
- **API-First**: All features exposed via RESTful endpoints.

---

## Project Structure
```
apps/
  accounts/   # User management (register, login, password reset)
  products/   # Product and category models, views, serializers
  cart/       # Cart and cart item logic
  orders/     # Order and order item logic
  payments/   # Payment integration and transaction audit
  core/       # Shared utilities
  url_links/  # URL listing utility
config/       # Django settings, URLs, WSGI/ASGI
services/     # (Optional) Shared business logic
utils/        # (Optional) Shared utilities
```

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd asma
```

### 2. Create and Activate a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Create a `.env` file in the project root with the following:
```
SECRET_KEY=your-django-secret-key
DATABASE_URL=your-database-url
# Safaricom Daraja credentials
DARAJA_CONSUMER_KEY=your-consumer-key
DARAJA_CONSUMER_SECRET=your-consumer-secret
DARAJA_SHORTCODE=your-shortcode
DARAJA_PASSKEY=your-passkey
DARAJA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/callback/
```

### 5. Database Setup
```bash
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run the Server
```bash
python manage.py runserver
```

---

## API Endpoints (Summary)
- `/api/v1/accounts/` — Registration, login, password reset, profile
- `/api/v1/products/` — Product and category listing
- `/api/v1/cart/` — Cart management and checkout
- `/api/v1/orders/` — Order management
- `/api/v1/payments/` — Payment initiation and callback

---

## Payment Integration (Safaricom Daraja)
- Initiate payment via STK push on checkout
- Callback endpoint for payment status update
- All credentials and URLs must be set in `.env`

---

## Security
- All secrets and credentials must be stored in `.env` (never in code)
- Uses Django's built-in security features and DRF best practices
- JWT authentication for all protected endpoints

---

## Contributing
- Fork the repo and create a feature branch
- Write tests for new features
- Submit a pull request

---

## License
MIT
