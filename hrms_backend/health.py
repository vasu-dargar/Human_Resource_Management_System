from django.http import JsonResponse
from django.utils.timezone import now
from django.db import connections
from django.db.utils import OperationalError


def health(request):
    db_ok = True
    db_error = None

    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except OperationalError as e:
        db_ok = False
        db_error = str(e)

    status = "ok" if db_ok else "degraded"
    http_status = 200 if db_ok else 503

    return JsonResponse(
        {
            "status": status,
            "database": "connected" if db_ok else "unreachable",
            "timestamp": now().isoformat(),
            "error": db_error,
        },
        status=http_status,
    )
