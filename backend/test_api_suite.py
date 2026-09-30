import os
import sys

# Ensure backend root is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def run_tests():
    app = create_app()
    client = app.test_client()

    print("==================================================")
    print("[TEST] RUNNING STAYEASE COMPLETE REST API TEST SUITE")
    print("==================================================")

    # 1. Health Check
    res = client.get('/health')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    health_data = res.get_json()
    assert health_data['status'] == 'healthy'
    print(f"[OK] 1. Health Check: Passed (engine: {health_data.get('engine')}, service: {health_data.get('service')})")

    # 2. Prometheus Metrics
    res = client.get('/metrics')
    assert res.status_code == 200, f"Metrics failed: {res.status_code}"
    assert b'http_requests_total' in res.data
    assert b'hotel_database_health_status' in res.data
    print("[OK] 2. Prometheus Metrics: Passed (exposition format verified)")

    # 3. List Hotels & Verify Seed Data
    res = client.get('/api/hotels')
    assert res.status_code == 200
    hotels_data = res.get_json()
    assert hotels_data['success'] is True
    assert len(hotels_data['hotels']) >= 8, f"Expected >= 8 hotels, got {len(hotels_data['hotels'])}"
    print(f"[OK] 3. Hotel Listings: Passed ({len(hotels_data['hotels'])} hotels verified)")

    # 4. Search and Filter Hotels
    res = client.get('/api/hotels?location=Goa')
    assert res.status_code == 200
    goa_hotels = res.get_json()['hotels']
    assert len(goa_hotels) >= 1
    assert 'Goa' in goa_hotels[0]['location']
    print(f"[OK] 4. Hotel Search (Goa): Passed ({len(goa_hotels)} matching property)")

    # 5. Hotel Details and Room Inventory
    res = client.get(f"/api/hotels/{hotels_data['hotels'][0]['id']}")
    assert res.status_code == 200
    hotel_detail = res.get_json()['hotel']
    assert 'rooms' in hotel_detail
    assert len(hotel_detail['rooms']) >= 1
    print(f"[OK] 5. Hotel Details & Rooms: Passed ({len(hotel_detail['rooms'])} room types found)")

    # 6. Customer Login
    res = client.post('/api/login', json={
        'email': 'alex.morgan@example.com',
        'password': 'user123'
    })
    assert res.status_code == 200
    login_data = res.get_json()
    token = login_data['token']
    assert token is not None
    auth_headers = {'Authorization': f'Bearer {token}'}
    print("[OK] 6. Customer Authentication: Passed (Token generated)")

    # 7. Customer /me endpoint
    res = client.get('/api/me', headers=auth_headers)
    assert res.status_code == 200
    me_data = res.get_json()
    assert me_data['user']['email'] == 'alex.morgan@example.com'
    print("[OK] 7. Authenticated User Profile: Passed")

    # 8. Create Hotel Booking
    room = hotel_detail['rooms'][0]
    res = client.post('/api/bookings', headers=auth_headers, json={
        'hotel_id': hotel_detail['id'],
        'room_id': room['id'],
        'check_in': '2026-11-10',
        'check_out': '2026-11-14',
        'guests': 2,
        'guest_name': 'Alex Morgan',
        'guest_email': 'alex.morgan@example.com',
        'guest_phone': '+1-555-0144',
        'special_requests': 'Ocean view corner room preferred.'
    })
    assert res.status_code == 201, f"Booking creation failed: {res.get_json()}"
    booking_result = res.get_json()
    booking = booking_result['booking']
    assert booking['booking_id'].startswith('STE-2026-')
    assert booking_result['breakdown']['nights'] == 4
    print(f"[OK] 8. Booking Creation: Passed (Booking ID: {booking['booking_id']}, 4 nights, Total: ${booking['total_amount']})")

    # 9. Simulated Payment Processing
    res = client.post('/api/payments', headers=auth_headers, json={
        'booking_id': booking['id'],
        'payment_method': 'UPI',
        'amount': booking['total_amount']
    })
    assert res.status_code == 201
    payment_data = res.get_json()
    assert payment_data['success'] is True
    assert payment_data['transaction_reference'].startswith('UPI-')
    print(f"[OK] 9. Simulated Payment: Passed (Txn: {payment_data['transaction_reference']})")

    # 10. Fetch Customer Bookings List
    res = client.get('/api/bookings', headers=auth_headers)
    assert res.status_code == 200
    user_bookings = res.get_json()['bookings']
    assert len(user_bookings) >= 1
    print(f"[OK] 10. My Bookings List: Passed ({len(user_bookings)} bookings retrieved)")

    # 11. Admin Login & Dashboard Analytics
    admin_res = client.post('/api/login', json={
        'email': 'admin@stayease.com',
        'password': 'admin123'
    })
    assert admin_res.status_code == 200
    admin_token = admin_res.get_json()['token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}

    res = client.get('/api/admin/dashboard', headers=admin_headers)
    assert res.status_code == 200
    dash_data = res.get_json()
    assert dash_data['stats']['total_hotels'] >= 8
    assert dash_data['stats']['total_bookings'] >= 5
    assert 'charts' in dash_data
    print("[OK] 11. Admin Dashboard & Charts: Passed (All KPIs and chart datasets populated)")

    # 12. Static Web App Serving
    res = client.get('/')
    assert res.status_code == 200
    assert b'StayEase' in res.data
    print("[OK] 12. Full-Stack Web Frontend Delivery: Passed")

    print("\nSUCCESS: ALL 12 END-TO-END SYSTEM INTEGRATION TESTS PASSED (100% SUCCESS)!")

if __name__ == '__main__':
    run_tests()
