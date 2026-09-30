import urllib.request
import json
from datetime import datetime, timedelta

base_url = "http://localhost:5000"

# 1. Login as user
login_req = urllib.request.Request(
    f"{base_url}/api/login",
    data=json.dumps({"email": "alex.morgan@example.com", "password": "user123"}).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)
login_res = json.loads(urllib.request.urlopen(login_req).read().decode('utf-8'))
token = login_res["token"]
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
today = datetime.now().strftime("%Y-%m-%d")
tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

# 2. Test booking with yesterday's date
print(f"Testing Yesterday's Check-In: {yesterday}...")
booking_data_yesterday = {
    "hotel_id": 1,
    "room_id": 1,
    "guest_name": "Alex Morgan",
    "guest_email": "alex.morgan@example.com",
    "guest_phone": "+91 98123 45678",
    "check_in": yesterday,
    "check_out": tomorrow,
    "guests": 2
}

try:
    req = urllib.request.Request(
        f"{base_url}/api/bookings",
        data=json.dumps(booking_data_yesterday).encode('utf-8'),
        headers=headers
    )
    res = urllib.request.urlopen(req)
    print("UNEXPECTED SUCCESS (Should have failed):", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    err_body = json.loads(e.read().decode('utf-8'))
    print(f"SUCCESSFULLY REJECTED [HTTP {e.code}]:", err_body.get("message"))

# 3. Test booking with valid dates (Today -> Tomorrow)
print(f"\nTesting Valid Check-In: {today} to {tomorrow}...")
booking_data_valid = {
    "hotel_id": 1,
    "room_id": 1,
    "guest_name": "Alex Morgan",
    "guest_email": "alex.morgan@example.com",
    "guest_phone": "+91 98123 45678",
    "check_in": today,
    "check_out": tomorrow,
    "guests": 2
}

try:
    req = urllib.request.Request(
        f"{base_url}/api/bookings",
        data=json.dumps(booking_data_valid).encode('utf-8'),
        headers=headers
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("SUCCESSFULLY BOOKED [HTTP 201]: Booking ID:", data["booking"]["booking_id"])
except Exception as e:
    print("FAILED:", str(e))
