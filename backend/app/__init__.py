import os
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from config.config import get_config
from services.metrics import track_request
from routes import (
    auth_bp,
    hotel_bp,
    room_bp,
    booking_bp,
    payment_bp,
    admin_bp,
    health_bp
)

def create_app(config_override=None):
    config = config_override or get_config()
    static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
    os.makedirs(static_folder, exist_ok=True)

    app = Flask(__name__, static_folder=static_folder)
    app.config.from_object(config)

    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Request metrics middleware
    @app.before_request
    def record_request_start_time():
        request.start_time = time.time()

    @app.after_request
    def record_metrics_after_request(response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            endpoint = request.endpoint or request.path
            track_request(
                method=request.method,
                endpoint=endpoint,
                status_code=response.status_code,
                duration=duration
            )
        return response

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(hotel_bp, url_prefix='/api/hotels')
    app.register_blueprint(room_bp, url_prefix='/api')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(health_bp, url_prefix='')  # exposes /health and /metrics

    # Root and Static files routing
    @app.route('/')
    def index():
        index_file = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({
            "service": "StayEase - Infrastructure Automation for Hotel Booking System API",
            "status": "online",
            "health_check": "/health",
            "metrics": "/metrics",
            "api_endpoints": {
                "auth": ["/api/register", "/api/login", "/api/me"],
                "hotels": ["/api/hotels", "/api/hotels/:id"],
                "rooms": ["/api/hotels/:id/rooms", "/api/rooms"],
                "bookings": ["/api/bookings", "/api/bookings/:id"],
                "payments": ["/api/payments"],
                "admin": ["/api/admin/dashboard"]
            }
        })

    @app.route('/<path:path>')
    def serve_static(path):
        target = os.path.join(app.static_folder, path)
        if os.path.exists(target):
            return send_from_directory(app.static_folder, path)
        index_file = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({'success': False, 'message': f'Path /{path} not found'}), 404

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found or endpoint does not exist.'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error occurred.'
        }), 500

    return app
