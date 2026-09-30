import os
from dotenv import load_dotenv

# Load .env file from root or backend directory if present
load_dotenv()

class Config:
    """Application Configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'stayease-secret-super-key-2026-cloud')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-cloud-hotel-jwt-secret-xyz-777')
    
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'hotel_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'hotel_password_secure_2026')
    DB_NAME = os.getenv('DB_NAME', 'hotel_booking_db')
    
    # SQLite fallback database file for easy local testing without external MySQL
    SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH', os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'hotel_booking.sqlite'))
    USE_SQLITE_FALLBACK = os.getenv('USE_SQLITE_FALLBACK', 'true').lower() in ('true', '1', 'yes')

    # Server configuration
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'true').lower() in ('true', '1', 'yes')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

def get_config():
    env = os.getenv('FLASK_ENV', 'development').lower()
    if env == 'production':
        return ProductionConfig()
    return DevelopmentConfig()
