import uuid
from services.db import query_one, execute

class Payment:
    @staticmethod
    def create(booking_id, payment_method, amount, payment_status='Success'):
        # Generate clean transaction reference ID
        prefix = {
            'Credit/Debit Card': 'CARD',
            'UPI': 'UPI',
            'Net Banking': 'NB'
        }.get(payment_method, 'TXN')
        txn_ref = f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

        sql = """
        INSERT INTO payments (booking_id, payment_method, amount, payment_status, transaction_reference)
        VALUES (%s, %s, %s, %s, %s)
        """
        payment_id = execute(sql, (
            int(booking_id), payment_method, float(amount), payment_status, txn_ref
        ))

        # Ensure booking status is marked as Confirmed on successful payment
        if payment_status == 'Success':
            execute("UPDATE bookings SET status = 'Confirmed' WHERE id = %s", (int(booking_id),))

        return Payment.get_by_id(payment_id)

    @staticmethod
    def get_by_id(payment_id):
        return query_one("SELECT * FROM payments WHERE id = %s", (payment_id,))

    @staticmethod
    def get_by_booking(booking_id):
        return query_one("SELECT * FROM payments WHERE booking_id = %s", (booking_id,))
