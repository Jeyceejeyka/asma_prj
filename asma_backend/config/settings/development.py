# from pathlib import Path
# import environ
# from datetime import timedelta
# from decouple import config


# BASE_DIR = Path(__file__).resolve().parent.parent.parent

# env = environ.Env()
# env_file = BASE_DIR.parent / ".env"

# if env_file.exists():
#     env.read_env(env_file)

# # Core security settings (FROM ENV, not hardcoded)
# SECRET_KEY = env('SECRET_KEY')

# DEBUG = env.bool('DEBUG', default=True)


# ALLOWED_HOSTS = env.list(
#     'ALLOWED_HOSTS'
# )

# CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])

# FRONTEND_URL = env('FRONTEND_URL')
# DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')

# # CORS Configuration (ADD THIS SECTION)
# CORS_ALLOWED_ORIGINS = env.list(
#     "CORS_ALLOWED_ORIGINS",
#     default=[],
# )

# CORS_ALLOW_CREDENTIALS = True  # Important for cookies

# CORS_ALLOW_METHODS = [
#     'DELETE',
#     'GET',
#     'OPTIONS',
#     'PATCH',
#     'POST',
#     'PUT',
# ]

# CORS_ALLOW_HEADERS = [
#     'accept',
#     'accept-encoding',
#     'authorization',
#     'content-type',
#     'dnt',
#     'origin',
#     'user-agent',
#     'x-csrftoken',
#     'x-requested-with',
#     'idempotency-key',
# ]

# # If you want to allow all origins during development (NOT for production)
# # CORS_ALLOW_ALL_ORIGINS = True  # Only use this for testing

# # Cloudinary Configuration
# import cloudinary

# def _strip_quotes(value: str) -> str:
#     return value.strip().strip('"').strip("'")

# cloudinary.config(
#     cloud_name=_strip_quotes(env('CLOUDINARY_CLOUD_NAME', default='')),
#     api_key=_strip_quotes(env('CLOUDINARY_API_KEY', default='')),
#     api_secret=_strip_quotes(env('CLOUDINARY_API_SECRET', default=''))
# )

# # Apps (ADD 'corsheaders' to INSTALLED_APPS)
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',

#     'rest_framework',
#     'rest_framework_simplejwt.token_blacklist',
    
#     'corsheaders',  # ADD THIS LINE
#     'cloudinary_storage',
#     'cloudinary',

#     'apps.url_links',
#     'apps.accounts',
#     'apps.products',
#     'apps.orders',
#     'apps.payments',
#     'apps.core',
#     'apps.analytics',
#     'apps.cart',
# ]

# # DRF config
# REST_FRAMEWORK = {
#     "DEFAULT_RENDERER_CLASSES": [
#         "rest_framework.renderers.JSONRenderer",
#         "rest_framework.renderers.BrowsableAPIRenderer",
#     ],
#     "DEFAULT_AUTHENTICATION_CLASSES": [
#         "apps.accounts.authentication.CookieJWTAuthentication",
#     ],
#     "DEFAULT_PERMISSION_CLASSES": [
#         "rest_framework.permissions.IsAuthenticated",
#     ],
# }

# # JWT
# SIMPLE_JWT = {
#     "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
#     "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
#     "ROTATE_REFRESH_TOKENS": True,
#     "BLACKLIST_AFTER_ROTATION": True,
# }

# # Middleware (ADD CorsMiddleware at the top)
# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',  # ADD THIS LINE - Must be at the top
#     'django.middleware.security.SecurityMiddleware',
#     'whitenoise.middleware.WhiteNoiseMiddleware',  #this is added after security middleware 
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# ROOT_URLCONF = 'config.urls'

# WSGI_APPLICATION = 'config.wsgi.application'

# # Templates
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# AUTH_USER_MODEL = 'accounts.User'



# # Database for Production
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": config("DB_NAME"),
#         "USER": config("DB_USER"),
#         "PASSWORD": config("DB_PASSWORD"),
#         "HOST": config("DB_HOST"),
#         "PORT": config("DB_PORT"),
#     },
# }


# DARAJA = {
#     "CONSUMER_KEY": env("DARAJA_CONSUMER_KEY"),
#     "CONSUMER_SECRET": env("DARAJA_CONSUMER_SECRET"),
#     "SHORTCODE": env("DARAJA_SHORTCODE"),
#     "PASSKEY": env("DARAJA_PASSKEY"),
#     "CALLBACK_URL": env("DARAJA_CALLBACK_URL"),
#     "BASE_URL": env(
#         "DARAJA_BASE_URL",
#     ),
# }

# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]

# # Internationalization
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True

# STATIC_URL = 'static/'
# STATIC_ROOT = BASE_DIR.parent / 'staticfiles'
# STORAGES = {
#     "staticfiles": {
#         "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
#     },
# }

# # Security headers — safe defaults for dev, flip in .env for prod
# SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=False)
# SESSION_COOKIE_SECURE = env.bool('SESSION_COOKIE_SECURE', default=False)
# SESSION_COOKIE_SAMESITE = env('SESSION_COOKIE_SAMESITE', default='None')
# CSRF_COOKIE_SECURE = env.bool('CSRF_COOKIE_SECURE', default=False)
# CSRF_COOKIE_SAMESITE = env('CSRF_COOKIE_SAMESITE', default='None')
# SECURE_BROWSER_XSS_FILTER = True
# SECURE_CONTENT_TYPE_NOSNIFF = True
# X_FRAME_OPTIONS = 'DENY'
# SECURE_HSTS_SECONDS = env.int('SECURE_HSTS_SECONDS', default=0)
# SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=False)
# SECURE_HSTS_PRELOAD = env.bool('SECURE_HSTS_PRELOAD', default=False)

# # Logging to stdout — docker compose logs -f captures this automatically
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {'console': {'class': 'logging.StreamHandler'}},
#     'root': {'handlers': ['console'], 'level': env('LOG_LEVEL', default='INFO')},
# }

# # Media and Cloudinary Storage
# MEDIA_URL = '/asma_media/'
# STORAGES = {
#     "default": {
#         "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
#     },
#     "staticfiles": {
#         "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
#     },
# }


# # Primary key
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


from .base import *

# ==============================================================================
# DEVELOPMENT
# ==============================================================================

DEBUG = True

# ==============================================================================
# HOSTS
# ==============================================================================

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=[
        "127.0.0.1",
        "localhost",
        "backend",
    ],
)

# ==============================================================================
# DATABASE
# ==============================================================================

DATABASES = {
    "default": env.db("DATABASE_URL")
}

# ==============================================================================
# FRONTEND
# ==============================================================================

FRONTEND_URL = env(
    "FRONTEND_URL",
    default="http://localhost:8081",
)

# ==============================================================================
# SECURITY
# ==============================================================================

SECURE_SSL_REDIRECT = False

SESSION_COOKIE_SECURE = False

CSRF_COOKIE_SECURE = False

SESSION_COOKIE_HTTPONLY = True

CSRF_COOKIE_HTTPONLY = False

SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SAMESITE = "Lax"

SECURE_HSTS_SECONDS = 0

SECURE_HSTS_INCLUDE_SUBDOMAINS = False

SECURE_HSTS_PRELOAD = False

# ==============================================================================
# CORS
# ==============================================================================

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:8081",
        "http://localhost:8083",
        "http://127.0.0.1:8000",
    ],
)

CORS_ALLOW_CREDENTIALS = True

# ==============================================================================
# CSRF
# ==============================================================================

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:8081",
        "http://localhost:8083",
        "http://127.0.0.1:8000",
    ],
)

# ==============================================================================
# EMAIL
# ==============================================================================

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ==============================================================================
# LOGGING
# ==============================================================================

LOGGING["root"]["level"] = "DEBUG"

LOGGING["loggers"] = {

    "django": {
        "handlers": ["console"],
        "level": "DEBUG",
        "propagate": False,
    },

    "django.db.backends": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": False,
    },

}