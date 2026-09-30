import time
from datetime import datetime, timezone
from flask import Blueprint, jsonify, Response
from services.db import check_db_health, query_one
from services.metrics import get_metrics_data, update_system_gauges

health_bp = Blueprint('health_bp', __name__)
_START_TIME = time.time()

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Application health endpoint used by AWS ALB, Docker healthcheck, and Prometheus"""
    db_healthy, engine_or_error = check_db_health()
    uptime_seconds = int(time.time() - _START_TIME)

    status = "healthy" if db_healthy else "degraded"
    status_code = 200 if db_healthy else 503

    # Update Prometheus gauges
    try:
        hotels_cnt = query_one("SELECT COUNT(*) as c FROM hotels")['c'] if db_healthy else 0
        bookings_cnt = query_one("SELECT COUNT(*) as c FROM bookings WHERE status = 'Confirmed'")['c'] if db_healthy else 0
        update_system_gauges(hotels_cnt, bookings_cnt, db_healthy)
    except Exception:
        pass

    return jsonify({
        "status": status,
        "service": "hotel-booking-api",
        "version": "1.0.0",
        "database": "connected" if db_healthy else "disconnected",
        "engine": engine_or_error if db_healthy else "unavailable",
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), status_code

@health_bp.route('/metrics', methods=['GET'])
def prometheus_metrics():
    """Prometheus exposition metrics scraping endpoint"""
    try:
        db_healthy, _ = check_db_health()
        if db_healthy:
            hotels_cnt = query_one("SELECT COUNT(*) as c FROM hotels")['c']
            bookings_cnt = query_one("SELECT COUNT(*) as c FROM bookings WHERE status = 'Confirmed'")['c']
            update_system_gauges(hotels_cnt, bookings_cnt, True)
        else:
            update_system_gauges(0, 0, False)
    except Exception:
        pass

    data, content_type = get_metrics_data()
    return Response(data, mimetype=content_type)
