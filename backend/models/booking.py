import random
import string
from datetime import datetime
from services.db import query, query_one, execute

class Booking:
    @staticmethod
    def generate_booking_code():
        """Generate human-friendly unique booking reference e.g. STE-2026-8742"""
        year = datetime.now().year
        suffix = ''.join(random.choices(string.digits, k=4))
        return f"STE-{year}-{suffix}"

    @staticmethod
    def create(user_id, hotel_id, room_id, guest_name, guest_email, guest_phone,
               check_in, check_out, guests, total_amount, special_requests=None, status='Confirmed'):
        booking_code = Booking.generate_booking_code()
        sql = """
        INSERT INTO bookings (
            booking_id, user_id, hotel_id, room_id, guest_name, guest_email, guest_phone,
            special_requests, check_in, check_out, guests, total_amount, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        row_id = execute(sql, (
            booking_code, int(user_id), int(hotel_id), int(room_id),
            guest_name.strip(), guest_email.strip(), guest_phone.strip(),
            (special_requests or '').strip(), str(check_in), str(check_out),
            int(guests), float(total_amount), status
        ))
        return Booking.get_by_id(row_id)

    @staticmethod
    def get_by_id(booking_row_id):
        sql = """
        SELECT b.*, 
               h.name as hotel_name, h.location as hotel_location, h.image as hotel_image,
               r.room_type, r.bed_type, r.image as room_image
        FROM bookings b
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = %s
        """
        return query_one(sql, (booking_row_id,))

    @staticmethod
    def get_by_code(booking_code):
        sql = """
        SELECT b.*, 
               h.name as hotel_name, h.location as hotel_location, h.image as hotel_image,
               r.room_type, r.bed_type, r.image as room_image
        FROM bookings b
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.booking_id = %s
        """
        return query_one(sql, (booking_code,))

    @staticmethod
    def get_by_user(user_id):
        sql = """
        SELECT b.*, 
               h.name as hotel_name, h.location as hotel_location, h.image as hotel_image,
               r.room_type, r.bed_type, r.image as room_image
        FROM bookings b
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = %s
        ORDER BY b.id DESC
        """
        return query(sql, (user_id,))

    @staticmethod
    def get_all(status=None, search=None):
        sql = """
        SELECT b.*, 
               h.name as hotel_name, h.location as hotel_location,
               r.room_type,
               u.name as user_name, u.email as user_email
        FROM bookings b
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        WHERE 1=1
        """
        params = []
        if status and status != 'All':
            sql += " AND b.status = %s"
            params.append(status)

        if search:
            sql += """ AND (
                LOWER(b.booking_id) LIKE %s OR 
                LOWER(b.guest_name) LIKE %s OR 
                LOWER(b.guest_email) LIKE %s OR 
                LOWER(h.name) LIKE %s
            )"""
            p = f"%{search.lower()}%"
            params.extend([p, p, p, p])

        sql += " ORDER BY b.id DESC"
        return query(sql, params)

    @staticmethod
    def update_status(booking_id_or_code, new_status):
        # Determine whether input is numerical row ID or booking_id string
        if str(booking_id_or_code).isdigit():
            execute("UPDATE bookings SET status = %s WHERE id = %s", (new_status, int(booking_id_or_code)))
            return Booking.get_by_id(int(booking_id_or_code))
        else:
            execute("UPDATE bookings SET status = %s WHERE booking_id = %s", (new_status, booking_id_or_code))
            return Booking.get_by_code(booking_id_or_code)

    @staticmethod
    def cancel(booking_id_or_code, user_id=None):
        if user_id:
            # Verify ownership
            existing = query_one(
                "SELECT id FROM bookings WHERE (id = %s OR booking_id = %s) AND user_id = %s", 
                (str(booking_id_or_code), str(booking_id_or_code), user_id)
            )
            if not existing:
                return None
        return Booking.update_status(booking_id_or_code, 'Cancelled')
