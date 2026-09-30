import os
import sys

# Ensure backend root is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"🚀 StayEase Hotel Booking API server starting on http://0.0.0.0:{port}")
    print(f"📊 Prometheus Metrics: http://localhost:{port}/metrics")
    print(f"💓 Health Check: http://localhost:{port}/health")
    app.run(host='0.0.0.0', port=port, debug=True)
