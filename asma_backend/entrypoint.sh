#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "[entrypoint] Starting Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120