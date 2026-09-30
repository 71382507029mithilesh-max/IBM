import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# Prometheus Metrics Definitions

# 1. Total HTTP Requests Counter
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total count of HTTP requests processed by endpoint and status code',
    ['method', 'endpoint', 'http_status']
)

# 2. HTTP Request Latency Histogram
REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint']
)

# 3. Active Bookings Gauge
ACTIVE_BOOKINGS_GAUGE = Gauge(
    'hotel_active_bookings_total',
    'Current number of confirmed and active hotel bookings'
)

# 4. Total Hotels Gauge
TOTAL_HOTELS_GAUGE = Gauge(
    'hotel_inventory_total',
    'Current number of hotels registered in the system'
)

# 5. Database Health Status Gauge (1 = healthy, 0 = unhealthy)
DB_HEALTH_GAUGE = Gauge(
    'hotel_database_health_status',
    'Database connection status (1 for healthy, 0 for unhealthy)'
)

# 6. HTTP Error Counter
HTTP_ERRORS = Counter(
    'http_errors_total',
    'Total count of HTTP 4xx and 5xx errors encountered',
    ['endpoint', 'status_code']
)

def track_request(method, endpoint, status_code, duration):
    """Update prometheus request counters and latency histogram"""
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, http_status=status_code).inc()
    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
    if status_code >= 400:
        HTTP_ERRORS.labels(endpoint=endpoint, status_code=status_code).inc()

def update_system_gauges(hotels_count, bookings_count, db_healthy):
    """Refresh system gauges for Prometheus scrapers"""
    TOTAL_HOTELS_GAUGE.set(hotels_count)
    ACTIVE_BOOKINGS_GAUGE.set(bookings_count)
    DB_HEALTH_GAUGE.set(1 if db_healthy else 0)

def get_metrics_data():
    """Return latest prometheus metrics payload and content type"""
    return generate_latest(), CONTENT_TYPE_LATEST
