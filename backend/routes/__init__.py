from .auth_routes import auth_bp
from .hotel_routes import hotel_bp
from .room_routes import room_bp
from .booking_routes import booking_bp
from .payment_routes import payment_bp
from .admin_routes import admin_bp
from .health_routes import health_bp

__all__ = [
    'auth_bp', 'hotel_bp', 'room_bp', 
    'booking_bp', 'payment_bp', 'admin_bp', 'health_bp'
]
