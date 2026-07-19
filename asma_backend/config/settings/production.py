from .base import *

# ==============================================================================
# PRODUCTION
# ==============================================================================

DEBUG = False

# ==============================================================================
# HOSTS
# ==============================================================================

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

FRONTEND_URL = env("FRONTEND_URL")

# ==============================================================================
# DATABASE
# ==============================================================================

DATABASES = {
    "default": env.db("DATABASE_URL")
}

# ==============================================================================
# HTTPS
# ==============================================================================

SECURE_SSL_REDIRECT = env.bool(
    "SECURE_SSL_REDIRECT",
    default=True,
)

USE_X_FORWARDED_HOST = True

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

# ==============================================================================
# COOKIES
# ==============================================================================

SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SECURE = True

SESSION_COOKIE_HTTPONLY = True

CSRF_COOKIE_HTTPONLY = False

SESSION_COOKIE_SAMESITE = "None"

CSRF_COOKIE_SAMESITE = "None"

# ==============================================================================
# HSTS
# ==============================================================================

SECURE_HSTS_SECONDS = 31536000

SECURE_HSTS_INCLUDE_SUBDOMAINS = True

SECURE_HSTS_PRELOAD = True

# ==============================================================================
# SECURITY HEADERS
# ==============================================================================

SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_BROWSER_XSS_FILTER = True

X_FRAME_OPTIONS = "DENY"

# ==============================================================================
# CORS
# ==============================================================================

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[],
)

CORS_ALLOW_CREDENTIALS = True

# ==============================================================================
# CSRF
# ==============================================================================

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[],
)

# ==============================================================================
# STATIC FILES
# ==============================================================================

STORAGES["staticfiles"] = {
    "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
}

# ==============================================================================
# LOGGING
# ==============================================================================

LOGGING["root"]["level"] = env(
    "LOG_LEVEL",
    default="INFO",
)

LOGGING["loggers"] = {

    "django": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": False,
    },

    "django.request": {
        "handlers": ["console"],
        "level": "ERROR",
        "propagate": False,
    },

    "gunicorn.error": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": True,
    },

    "gunicorn.access": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": False,
    },

    "django.security": {
        "handlers": ["console"],
        "level": "WARNING",
        "propagate": False,
    },

}