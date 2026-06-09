from pathlib import Path
import environ
from datetime import timedelta

# Base directory (correct for config/settings/development.py)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Environment setup
env = environ.Env()
env_file = BASE_DIR / '.env'

if env_file.exists():
    env.read_env(env_file)

# Core security settings (FROM ENV, not hardcoded)
SECRET_KEY = env('SECRET_KEY')

DEBUG = env.bool('DEBUG', default=True)

ALLOWED_HOSTS = env.list(
    'ALLOWED_HOSTS',
    default=['127.0.0.1', 'localhost']
)

FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@example.com')

# CORS Configuration (ADD THIS SECTION)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:8083",
    "http://127.0.0.1:8000",
    FRONTEND_URL,  # Use the env variable
]

CORS_ALLOW_CREDENTIALS = True  # Important for cookies

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'idempotency-key',
]

# If you want to allow all origins during development (NOT for production)
# CORS_ALLOW_ALL_ORIGINS = True  # Only use this for testing

# Cloudinary Configuration
import cloudinary

def _strip_quotes(value: str) -> str:
    return value.strip().strip('"').strip("'")

cloudinary.config(
    cloud_name=_strip_quotes(env('CLOUDINARY_CLOUD_NAME', default='')),
    api_key=_strip_quotes(env('CLOUDINARY_API_KEY', default='')),
    api_secret=_strip_quotes(env('CLOUDINARY_API_SECRET', default=''))
)

# Apps (ADD 'corsheaders' to INSTALLED_APPS)
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    
    'corsheaders',  # ADD THIS LINE
    'cloudinary_storage',
    'cloudinary',

    'apps.url_links',
    'apps.accounts',
    'apps.products',
    'apps.orders',
    'apps.payments',
    'apps.core',
    'apps.analytics',
    'apps.cart',
]

# DRF config
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.accounts.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# Middleware (ADD CorsMiddleware at the top)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ADD THIS LINE - Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

WSGI_APPLICATION = 'config.wsgi.application'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_USER_MODEL = 'accounts.User'

# Database
DATABASES = {
    'default': env.db()
}

DARAJA = {
    "CONSUMER_KEY": env("DARAJA_CONSUMER_KEY"),
    "CONSUMER_SECRET": env("DARAJA_CONSUMER_SECRET"),
    "SHORTCODE": env("DARAJA_SHORTCODE"),
    "PASSKEY": env("DARAJA_PASSKEY"),
    "CALLBACK_URL": env("DARAJA_CALLBACK_URL"),
    "BASE_URL": env(
        "DARAJA_BASE_URL",
        default="https://sandbox.safaricom.co.ke"
    ),
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static
STATIC_URL = 'static/'

# Media and Cloudinary Storage
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
MEDIA_URL = '/asma_media/'

# Primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'