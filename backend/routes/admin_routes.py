from flask import Blueprint, jsonify
from services.db import query, query_one
from routes.auth_routes import admin_required

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    try:
        # 1. Total Users
        total_users = query_one("SELECT COUNT(*) as count FROM users")['count']

        # 2. Total Hotels
        total_hotels = query_one("SELECT COUNT(*) as count FROM hotels")['count']

        # 3. Total Rooms
        total_rooms = query_one("SELECT COUNT(*) as count FROM rooms")['count']

        # 4. Total Bookings
        total_bookings = query_one("SELECT COUNT(*) as count FROM bookings")['count']

        # 5. Confirmed Bookings
        confirmed_bookings = query_one("SELECT COUNT(*) as count FROM bookings WHERE status = 'Confirmed'")['count']

        # 6. Cancelled Bookings
        cancelled_bookings = query_one("SELECT COUNT(*) as count FROM bookings WHERE status = 'Cancelled'")['count']

        # 7. Completed Bookings
        completed_bookings = query_one("SELECT COUNT(*) as count FROM bookings WHERE status = 'Completed'")['count']

        # 8. Total Revenue (sum of total_amount from Confirmed or Completed bookings)
        revenue_res = query_one("SELECT SUM(total_amount) as total FROM bookings WHERE status IN ('Confirmed', 'Completed')")
        total_revenue = float(revenue_res['total'] or 0.0)

        # 9. Bookings by Hotel (for Chart breakdown)
        hotel_bookings = query("""
        SELECT h.name as hotel_name, COUNT(b.id) as bookings_count, COALESCE(SUM(b.total_amount), 0) as total_revenue
        FROM hotels h
        LEFT JOIN bookings b ON h.id = b.hotel_id
        GROUP BY h.id, h.name
        ORDER BY bookings_count DESC
        LIMIT 6
        """)

        # 10. Status breakdown for donut/pie chart
        status_breakdown = [
            {'status': 'Confirmed', 'count': confirmed_bookings, 'color': '#10B981'},
            {'status': 'Completed', 'count': completed_bookings, 'color': '#3B82F6'},
            {'status': 'Cancelled', 'count': cancelled_bookings, 'color': '#EF4444'}
        ]

        # 11. Recent 5 Bookings
        recent_bookings = query("""
        SELECT b.id, b.booking_id, b.guest_name, b.check_in, b.check_out, b.total_amount, b.status, b.booking_date,
               h.name as hotel_name
        FROM bookings b
        JOIN hotels h ON b.hotel_id = h.id
        ORDER BY b.id DESC
        LIMIT 5
        """)

        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_hotels': total_hotels,
                'total_rooms': total_rooms,
                'total_bookings': total_bookings,
                'confirmed_bookings': confirmed_bookings,
                'cancelled_bookings': cancelled_bookings,
                'completed_bookings': completed_bookings,
                'total_revenue': total_revenue
            },
            'charts': {
                'hotel_performance': hotel_bookings,
                'status_breakdown': status_breakdown
            },
            'recent_bookings': recent_bookings
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to compile dashboard metrics: {str(e)}'}), 500
