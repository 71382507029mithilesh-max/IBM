import os
import sqlite3
import json
import pymysql
from pymysql.cursors import DictCursor
from config.config import get_config

config = get_config()

_db_engine = None  # 'mysql' or 'sqlite'

import socket

def is_port_open(host, port, timeout=0.8):
    """Quick socket check to see if database port is reachable"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((host, port))
        s.close()
        return True
    except Exception:
        return False

def get_mysql_connection():
    """Attempt to establish a MySQL connection if port is open"""
    try:
        # Check if MySQL host:port is reachable first to avoid multi-second OS blocking
        target_host = '127.0.0.1' if config.DB_HOST == 'localhost' else config.DB_HOST
        if not is_port_open(target_host, config.DB_PORT):
            return None

        conn = pymysql.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
            cursorclass=DictCursor,
            connect_timeout=2,
            autocommit=True
        )
        return conn
    except Exception:
        return None

def get_sqlite_connection():
    """Get or create SQLite connection with dictionary-like row factory"""
    db_path = os.path.abspath(config.SQLITE_DB_PATH)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_schema(conn):
    """Initialize SQLite database schema and seed data if tables are missing"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='hotels';")
    if cursor.fetchone():
        cursor.close()
        return

    print("[StayEase DB] Initializing SQLite database schema and realistic sample data...")
    
    # 1. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Hotels
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        rating REAL DEFAULT 4.5,
        image TEXT NOT NULL,
        gallery TEXT,
        facilities TEXT,
        starting_price REAL NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Rooms
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id INTEGER NOT NULL,
        room_type TEXT NOT NULL,
        price REAL NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 2,
        bed_type TEXT NOT NULL DEFAULT 'King Bed',
        description TEXT,
        image TEXT NOT NULL,
        facilities TEXT,
        availability INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    );
    """)

    # 4. Bookings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        hotel_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        special_requests TEXT,
        check_in TEXT NOT NULL,
        check_out TEXT NOT NULL,
        guests INTEGER NOT NULL DEFAULT 1,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Confirmed',
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
    """)

    # 5. Payments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'Success',
        transaction_reference TEXT NOT NULL UNIQUE,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );
    """)

    # Seed data
    # Password hash corresponds to 'admin123' and 'user123'
    admin_pwd_hash = "scrypt:32768:8:1$TRgwmGvBdjvSpbwh$c04f09c150ef890745a9d84d5ff155eeb696bed1752f23528d7dd2c9b5f68102c974a723c7d36ddb3459803bb271a04d1de37fa9d674acf72c3eb3d84dd9e486"
    user_pwd_hash = "scrypt:32768:8:1$G0jIOQ2cljJWDHRn$b02d67353f8e0e7a48973060dc72638a6400475662af9653573204137294d2eac995b897d28eb42c9a406d6aa0bb5c82e7fd6395f394061c2fa8eade2e1f3510"
    
    users_data = [
        (1, 'Admin User', 'admin@stayease.com', '+91-98765-43210', admin_pwd_hash, 'admin'),
        (2, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', user_pwd_hash, 'user'),
        (3, 'Sophia Patel', 'sophia.patel@example.com', '+91-99887-76655', user_pwd_hash, 'user')
    ]
    cursor.executemany("INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)", users_data)

    hotels_data = [
        (1, 'The Leela Beach Resort & Spa', 'South Goa, Goa',
         'Nestled along the pristine Mobor Beach, The Leela Goa offers 75 acres of lush tropical lagoons, private beach access, 12-hole golf, and world-class Ayurvedic spa sanctuaries.',
         4.9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Swimming pool, Beach Access, Restaurant, Spa, Air conditioning, 24/7 reception, Golf Course', 5500.00),
        
        (2, 'The Taj Mahal Palace & Tower', 'Colaba, Mumbai, Maharashtra',
         'Built in 1903 facing the Gateway of India and the Arabian Sea, this legendary architectural marvel offers signature fine dining, heritage suites, and legendary Indian hospitality.',
         4.9, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Swimming pool, Arabian Sea View, Restaurant, 24/7 reception, Jiva Spa, Valet Parking', 8900.00),
        
        (3, 'The Oberoi Udaivilas Palace', 'Lake Pichola, Udaipur, Rajasthan',
         'Sprawled over 50 acres on the tranquil banks of Lake Pichola, featuring grand domes, hand-carved stone columns, gold leaf frescoes, and private boat transfers.',
         4.9, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Swimming pool, Lake View, Fine Dining, Royal Spa, Air conditioning, Boat Transfers', 9500.00),
        
        (4, 'ITC Grand Chola Luxury Collection', 'Guindy, Chennai, Tamil Nadu',
         'Inspired by the monumental Chola Dynasty temple architecture, presenting 10 award-winning restaurants, royal marble corridors, and grand presidential suites.',
         4.8, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Swimming pool, 10 Restaurants, Kaya Kalp Spa, Air conditioning, 24/7 reception, Fitness Center', 4800.00),

        (5, 'Wildflower Hall Himalayan Sanctuary', 'Mashobra, Shimla, Himachal Pradesh',
         'Perched 8,250 feet above sea level amidst majestic cedar pine forests, offering heated infinity hot tubs overlooking snow-clad Himalayan mountain peaks.',
         4.9, 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Heated Indoor Pool, Cedar Spa, Mountain View, Restaurant, Fireplace, Nature Trails', 7200.00),

        (6, 'Kumarakom Lake Resort & Heritage', 'Kumarakom, Kottayam, Kerala',
         'Consistently awarded the jewel of Kerala backwaters, offering 16th-century heritage villas, meander pool villas, and houseboats gently floating along Vembanad Lake.',
         4.8, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Infinity Pool, Backwater Cruise, Ayurvedic Spa, Seafood Restaurant, Balcony', 6200.00),

        (7, 'Rambagh Palace Heritage Royal', 'Bhawani Singh Road, Jaipur, Rajasthan',
         'The former residence of the Maharaja of Jaipur, this jewel of Rajasthan features 47 acres of tranquil Mughal gardens, peacocks, and opulent Rajput craftsmanship.',
         4.9, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Palace Gardens, Swimming pool, Fine Dining, Peacock Courtyard, Royal Spa, Room service', 8500.00),

        (8, 'The Ritz-Carlton Garden City', 'Residency Road, Bengaluru, Karnataka',
         'A sanctuary of urban luxury in India’s Silicon Valley, featuring a stunning rooftop lounge, Jaali architectural lattice work, and serene wellness retreats.',
         4.7, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
         '["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]',
         'Wi-Fi, Rooftop Bar, Spa, Swimming pool, 24/7 reception, Business Lounge, Valet Parking', 5200.00)
    ]
    cursor.executemany("INSERT INTO hotels (id, name, location, description, rating, image, gallery, facilities, starting_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", hotels_data)

    rooms_data = [
        (1, 1, 'Deluxe Lagoon View King Suite', 5500.00, 2, 'King Bed', 'Private Portuguese balcony overlooking tranquil freshwater lagoons with luxury marble bathroom.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Lagoon View, Balcony, Mini Bar, King Bed, Free Wi-Fi, Ayurvedic Toiletries', 1),
        (2, 1, 'Royal Beachfront Villa with Plunge Pool', 11200.00, 4, 'Master King Bed', 'Direct golden sand beach access, private plunge pool, outdoor daybed pavilion, and personal butler.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Private Plunge Pool, Beach Access, Butler Service, Jacuzzi, Free Breakfast', 1),

        (3, 2, 'Gateway Heritage Sea Facing Room', 8900.00, 2, 'King Bed', 'Panoramic Arabian Sea views looking out onto the Gateway of India; rich Burmese teakwood furnishings.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 'Sea View, High-Speed Wi-Fi, Work Desk, Nespresso, Smart Lighting', 1),
        (4, 2, 'Grand Presidential Luxury Suite', 18500.00, 4, '2 King Beds', 'The ultimate Mumbai residence featuring private dining hall, curated Indian art, and 24-hour butler.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Arabian Sea View, Butler Service, Deep Soaking Tub, Executive Lounge', 1),

        (5, 3, 'Premier Lake View Suite with Pool', 9500.00, 2, 'King Bed', 'Opens directly onto a semi-private moat pool overlooking Lake Pichola and the City Palace.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80', 'Lake View, Pool Access, Mewar Architecture, Clawfoot Tub, Free Wi-Fi', 1),
        (6, 3, 'Kohinoor Royal Palace Villa', 22000.00, 4, '2 King Beds', 'Gold-leaf ceilings, mirror mosaic styling, private courtyard pool, and Rajasthani royal dining.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Private Pool, Garden Courtyard, Royal Dining, Jacuzzi, Lake Panorama', 1),

        (7, 4, 'Executive Club Luxury Room', 4800.00, 2, 'King Bed', 'Spacious royal chamber with hand-carved temple motifs, plush mattress, and city views.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 'City View, King Bed, Free Wi-Fi, Rain Shower, Express Check-In', 1),
        (8, 4, 'Chola Royal Chamber Suite', 9800.00, 4, '2 Queen Beds', 'Dual chamber family suite inspired by Tanjore art, with deep soaking tub and lounge access.', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', '2 Queen Beds, Deep Tub, Workstation, Lounge Access, Free Breakfast', 1),

        (9, 5, 'Mountain View Cedar Chalet', 7200.00, 2, 'King Bed', 'Solid teakwood floorboards, working fireplace, and panoramic views of snow-capped Himalayan ranges.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80', 'Himalayan View, Fireplace, Heated Floors, Balcony, Coffee Bar', 1),
        (10, 5, 'Himalayan Pinnacle Master Suite', 14500.00, 4, '2 King Beds', 'Two master bedrooms opening directly onto private heated deck facing the Pir Panjal ranges.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Heated Deck, 2 King Beds, Fireplace, Cedar Bath, Mountain Vista', 1),

        (11, 6, 'Traditional Kerala Heritage Villa', 6200.00, 2, 'King Bed', 'Century-old homestead reconstructed with wooden gables, open-to-sky shower, and garden courtyard.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 'Open-to-sky Shower, Garden View, King Bed, Free Wi-Fi, Heritage Woodwork', 1),
        (12, 6, 'Luxury Backwater Pavilion with Jacuzzi', 12800.00, 4, '1 King + 2 Twin Beds', 'Set directly at the edge of the backwaters with private infinity plunge jacuzzi and sunset deck.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 'Backwater View, Private Jacuzzi, Sunset Deck, Butler Service, Dining Nook', 1),

        (13, 7, 'Palace Luxury Historical Room', 8500.00, 2, 'King Bed', 'Authentic heritage room adorned with antique Rajput weapons, miniature paintings, and garden views.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Palace Garden View, King Bed, Heritage Decor, Marble Bathroom, Free Wi-Fi', 1),
        (14, 7, 'Royal Maharajah Suite', 19500.00, 4, '2 King Beds', 'The pinnacle of Rajasthani royalty with private terrace, crystal chandeliers, and dining hall.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Private Terrace, Royal Courtyard, Peacock View, Jacuzzi, Butler Service', 1),

        (15, 8, 'Deluxe Garden View King Room', 5200.00, 2, 'King Bed', 'Modern technological comforts paired with hand-tufted carpets and city skyline views.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 'City Skyline, King Bed, Free High-Speed Wi-Fi, Ergonomic Desk, Marble Bath', 1),
        (16, 8, 'Executive Metropolitan Suite', 10500.00, 3, 'King Bed + Daybed', 'Spacious executive sanctuary with private meeting lounge, Nespresso bar, and club access.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 'Ritz-Carlton Club Access, Meeting Lounge, Deep Tub, Sunset View, Breakfast', 1)
    ]
    cursor.executemany("INSERT INTO rooms (id, hotel_id, room_type, price, capacity, bed_type, description, image, facilities, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", rooms_data)

    bookings_data = [
        (1, 'STE-2026-9101', 2, 1, 1, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'Late check-in requested at 7 PM. High floor preferred.', '2026-10-15', '2026-10-18', 2, 18480.00, 'Confirmed', '2026-09-28 14:20:00'),
        (2, 'STE-2026-4428', 2, 2, 3, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'Quiet room facing the Arabian Sea.', '2026-11-02', '2026-11-05', 2, 29904.00, 'Confirmed', '2026-09-29 09:15:00'),
        (3, 'STE-2026-3391', 3, 3, 5, 'Sophia Patel', 'sophia.patel@example.com', '+91-99887-76655', 'Celebrating anniversary! Flowers and cake if possible.', '2026-12-20', '2026-12-24', 2, 42560.00, 'Confirmed', '2026-09-30 11:45:00'),
        (4, 'STE-2026-7812', 3, 5, 9, 'Sophia Patel', 'sophia.patel@example.com', '+91-99887-76655', 'None', '2026-08-10', '2026-08-12', 2, 16128.00, 'Completed', '2026-08-01 10:00:00'),
        (5, 'STE-2026-1109', 2, 6, 11, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'Travel date rescheduled', '2026-09-01', '2026-09-03', 2, 13888.00, 'Cancelled', '2026-08-25 16:30:00')
    ]
    cursor.executemany("INSERT INTO bookings (id, booking_id, user_id, hotel_id, room_id, guest_name, guest_email, guest_phone, special_requests, check_in, check_out, guests, total_amount, status, booking_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", bookings_data)

    payments_data = [
        (1, 1, 'Credit/Debit Card', 18480.00, 'Success', 'TXN-LEELA-9101-18480', '2026-09-28 14:21:00'),
        (2, 2, 'UPI', 29904.00, 'Success', 'UPI-TAJ-4428-29904', '2026-09-29 09:16:00'),
        (3, 3, 'Net Banking', 42560.00, 'Success', 'NB-UDVIL-3391-42560', '2026-09-30 11:46:00'),
        (4, 4, 'Credit/Debit Card', 16128.00, 'Success', 'TXN-SHIML-7812-16128', '2026-08-01 10:01:00')
    ]
    cursor.executemany("INSERT INTO payments (id, booking_id, payment_method, amount, payment_status, transaction_reference, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)", payments_data)

    conn.commit()
    cursor.close()
    print("[StayEase DB] Sample database successfully seeded.")

def get_connection():
    """Determine best connection (MySQL preferred, SQLite fallback)"""
    global _db_engine
    
    # 1. Try MySQL first
    mysql_conn = get_mysql_connection()
    if mysql_conn:
        _db_engine = 'mysql'
        return mysql_conn, 'mysql'
    
    # 2. Fall back to SQLite if enabled
    if config.USE_SQLITE_FALLBACK:
        sqlite_conn = get_sqlite_connection()
        init_sqlite_schema(sqlite_conn)
        _db_engine = 'sqlite'
        return sqlite_conn, 'sqlite'
    
    raise ConnectionError("Unable to connect to MySQL database and SQLite fallback is disabled.")

def get_current_engine():
    global _db_engine
    if not _db_engine:
        _, engine = get_connection()
        return engine
    return _db_engine

def query(sql, params=None):
    """Execute SQL query and return list of dicts"""
    conn, engine = get_connection()
    try:
        if engine == 'mysql':
            cursor = conn.cursor()
            cursor.execute(sql, params or ())
            res = cursor.fetchall()
            cursor.close()
            conn.close()
            return res
        else:
            # SQLite uses '?' instead of '%s'
            sqlite_sql = sql.replace('%s', '?')
            cursor = conn.cursor()
            cursor.execute(sqlite_sql, params or ())
            rows = cursor.fetchall()
            res = [dict(row) for row in rows]
            cursor.close()
            conn.close()
            return res
    except Exception as e:
        conn.close()
        raise e

def query_one(sql, params=None):
    """Execute SQL query and return single dict or None"""
    res = query(sql, params)
    return res[0] if res else None

def execute(sql, params=None):
    """Execute INSERT/UPDATE/DELETE and return lastrowid"""
    conn, engine = get_connection()
    try:
        if engine == 'mysql':
            cursor = conn.cursor()
            cursor.execute(sql, params or ())
            last_id = cursor.lastrowid
            cursor.close()
            conn.close()
            return last_id
        else:
            sqlite_sql = sql.replace('%s', '?')
            cursor = conn.cursor()
            cursor.execute(sqlite_sql, params or ())
            last_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            return last_id
    except Exception as e:
        conn.close()
        raise e

def check_db_health():
    """Check database connection and return status and active engine"""
    try:
        res = query_one("SELECT 1 as test")
        if res and res.get('test') == 1:
            return True, get_current_engine()
        return False, "Query verification failed"
    except Exception as e:
        return False, str(e)
