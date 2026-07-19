#!/bin/sh

set -e

echo "=================================================="
echo "🚀 Starting ASMA Backend"
echo "=================================================="

echo ""
echo "Python Version"
python --version

echo ""
echo "Django Settings"
echo "${DJANGO_SETTINGS_MODULE}"

echo ""
echo "Running database migrations..."
python manage.py migrate --noinput

echo ""
echo "Collecting static files..."
python manage.py collectstatic --noinput

###############################################################################
# Optional Superuser
###############################################################################

if [ "$AUTO_CREATE_SUPERUSER" = "True" ]; then
    echo ""
    echo "Creating superuser (if needed)..."

    python manage.py seed_admin || true
fi

###############################################################################
# Optional Category Seeder
###############################################################################

if [ "$AUTO_SEED_CATEGORIES" = "True" ]; then
    echo ""
    echo "Seeding categories..."

    python manage.py seed_categories || true
fi

echo ""
echo "=================================================="
echo "Starting Gunicorn"
echo "=================================================="

exec gunicorn config.wsgi:application \
    --config gunicorn.conf.py