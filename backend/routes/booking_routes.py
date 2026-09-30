from datetime import datetime
from flask import Blueprint, request, jsonify
from models.booking import Booking
from models.room import Room
from models.hotel import Hotel
from routes.auth_routes import login_required

booking_bp = Blueprint('booking_bp', __name__)

@booking_bp.route('', methods=['POST'])
@login_required
def create_booking():
    data = request.get_json() or {}
    user_id = request.current_user['id']
    hotel_id = data.get('hotel_id')
    room_id = data.get('room_id')
    guest_name = data.get('guest_name', request.current_user['name'])
    guest_email = data.get('guest_email', request.current_user['email'])
    guest_phone = data.get('guest_phone', request.current_user['phone'])
    check_in = data.get('check_in')
    check_out = data.get('check_out')
    guests = data.get('guests', 1)
    special_requests = data.get('special_requests', '')

    if not hotel_id or not room_id or not check_in or not check_out:
        return jsonify({'success': False, 'message': 'Hotel, room, check-in, and check-out dates are required.'}), 400

    # Validate dates
    try:
        ci_date = datetime.strptime(check_in, '%Y-%m-%d')
        co_date = datetime.strptime(check_out, '%Y-%m-%d')
        today = datetime.now().date()
        if ci_date.date() < today:
            return jsonify({'success': False, 'message': 'Check-in date cannot be in the past (yesterday or earlier). Please select today or a future date.'}), 400
        if co_date <= ci_date:
            return jsonify({'success': False, 'message': 'Check-out date must be after check-in date.'}), 400
        nights = (co_date - ci_date).days
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    room = Room.get_by_id(room_id)
    if not room:
        return jsonify({'success': False, 'message': 'Selected room not found.'}), 404

    if not room.get('availability'):
        return jsonify({'success': False, 'message': 'This room is currently unavailable for booking.'}), 400

    # Calculate total amount (Room rate * nights + 12% standard taxes)
    room_rate = float(room['price'])
    subtotal = room_rate * nights
    taxes = round(subtotal * 0.12, 2)
    total_amount = round(subtotal + taxes, 2)

    try:
        booking = Booking.create(
            user_id=user_id,
            hotel_id=hotel_id,
            room_id=room_id,
            guest_name=guest_name,
            guest_email=guest_email,
            guest_phone=guest_phone,
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_amount=total_amount,
            special_requests=special_requests,
            status='Confirmed'
        )
        return jsonify({
            'success': True,
            'message': 'Booking confirmed successfully!',
            'booking': booking,
            'breakdown': {
                'nights': nights,
                'price_per_night': room_rate,
                'subtotal': subtotal,
                'taxes': taxes,
                'total': total_amount
            }
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Booking creation failed: {str(e)}'}), 500

@booking_bp.route('', methods=['GET'])
@login_required
def get_user_bookings():
    try:
        user = request.current_user
        if user['role'] == 'admin':
            status = request.args.get('status')
            search = request.args.get('search')
            bookings = Booking.get_all(status=status, search=search)
        else:
            bookings = Booking.get_by_user(user['id'])

        return jsonify({
            'success': True,
            'count': len(bookings),
            'bookings': bookings
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching bookings: {str(e)}'}), 500

@booking_bp.route('/<identifier>', methods=['GET'])
@login_required
def get_booking(identifier):
    try:
        if identifier.isdigit():
            booking = Booking.get_by_id(int(identifier))
        else:
            booking = Booking.get_by_code(identifier)

        if not booking:
            return jsonify({'success': False, 'message': 'Booking record not found'}), 404

        # Regular users can only inspect their own bookings
        user = request.current_user
        if user['role'] != 'admin' and booking['user_id'] != user['id']:
            return jsonify({'success': False, 'message': 'Unauthorized to view this booking'}), 403

        return jsonify({'success': True, 'booking': booking}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching booking: {str(e)}'}), 500

@booking_bp.route('/<identifier>', methods=['PUT'])
@login_required
def update_booking(identifier):
    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({'success': False, 'message': 'New status must be provided'}), 400

    user = request.current_user
    # Admin can change to any status; User can only change to 'Cancelled'
    if user['role'] != 'admin' and new_status != 'Cancelled':
        return jsonify({'success': False, 'message': 'Users can only request cancellation'}), 403

    try:
        updated = Booking.cancel(identifier, user_id=None if user['role'] == 'admin' else user['id']) if new_status == 'Cancelled' else Booking.update_status(identifier, new_status)
        if not updated:
            return jsonify({'success': False, 'message': 'Booking not found or update unauthorized'}), 404
        return jsonify({
            'success': True,
            'message': f'Booking status successfully updated to {new_status}',
            'booking': updated
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Status update failed: {str(e)}'}), 500

@booking_bp.route('/<identifier>', methods=['DELETE'])
@login_required
def cancel_booking_endpoint(identifier):
    user = request.current_user
    try:
        cancelled = Booking.cancel(identifier, user_id=None if user['role'] == 'admin' else user['id'])
        if not cancelled:
            return jsonify({'success': False, 'message': 'Booking not found or not owned by user'}), 404
        return jsonify({
            'success': True,
            'message': 'Booking successfully cancelled.',
            'booking': cancelled
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Cancellation failed: {str(e)}'}), 500
