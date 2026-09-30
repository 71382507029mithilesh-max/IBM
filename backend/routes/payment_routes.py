from flask import Blueprint, request, jsonify
from models.payment import Payment
from models.booking import Booking
from routes.auth_routes import login_required

payment_bp = Blueprint('payment_bp', __name__)

@payment_bp.route('', methods=['POST'])
@login_required
def process_payment():
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method', 'Credit/Debit Card')
    amount = data.get('amount')

    if not booking_id or amount is None:
        return jsonify({'success': False, 'message': 'booking_id and amount are required.'}), 400

    valid_methods = ['Credit/Debit Card', 'UPI', 'Net Banking']
    if payment_method not in valid_methods:
        return jsonify({'success': False, 'message': f'Invalid payment method. Choose from: {", ".join(valid_methods)}'}), 400

    # Verify booking exists
    booking = Booking.get_by_id(int(booking_id)) if str(booking_id).isdigit() else Booking.get_by_code(booking_id)
    if not booking:
        return jsonify({'success': False, 'message': 'Referenced booking does not exist.'}), 404

    try:
        # Simulate payment success
        payment = Payment.create(
            booking_id=booking['id'],
            payment_method=payment_method,
            amount=amount,
            payment_status='Success'
        )

        return jsonify({
            'success': True,
            'message': 'Booking Confirmed Successfully! Payment processed.',
            'payment': payment,
            'booking_id': booking['booking_id'],
            'transaction_reference': payment['transaction_reference']
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Payment simulation failed: {str(e)}'}), 500

@payment_bp.route('/<int:booking_id>', methods=['GET'])
@login_required
def get_payment_details(booking_id):
    try:
        payment = Payment.get_by_booking(booking_id)
        if not payment:
            return jsonify({'success': False, 'message': 'No payment found for this booking.'}), 404
        return jsonify({'success': True, 'payment': payment}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching payment: {str(e)}'}), 500
