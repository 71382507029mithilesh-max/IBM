#!/usr/bin/env python3
"""
StayEase - Local Demonstration Runner
Starts the Flask API server with in-memory/SQLite database auto-seeding
and serves the complete full-stack React frontend.
"""

import os
import sys
import webbrowser

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_dir)

from app import create_app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app = create_app()

    print("\n" + "=" * 65)
    print("STAYEASE: Infrastructure Automation for Hotel Booking System")
    print("=" * 65)
    print(f"[*] Application URL:         http://localhost:{port}")
    print(f"[*] Infrastructure Health:   http://localhost:{port}/health")
    print(f"[*] Prometheus Metrics:      http://localhost:{port}/metrics")
    print("-" * 65)
    print("[*] Presentation Accounts:")
    print("    Customer: alex.morgan@example.com / user123")
    print("    Admin:    admin@stayease.com       / admin123")
    print("=" * 65 + "\n")

    try:
        webbrowser.open(f'http://localhost:{port}')
    except Exception:
        pass

    app.run(host='0.0.0.0', port=port, debug=False)
