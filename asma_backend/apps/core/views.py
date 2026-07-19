from django.db import connections
from django.http import JsonResponse
from django.utils import timezone


def health(request):
    try:
        connections["default"].cursor()

        return JsonResponse(
            {
                "status": "healthy",
                "database": "ok",
                "timestamp": timezone.now().isoformat(),
            },
            status=200,
        )

    except Exception as exc:
        return JsonResponse(
            {
                "status": "unhealthy",
                "database": "error",
                "error": str(exc),
                "timestamp": timezone.now().isoformat(),
            },
            status=503,
        )