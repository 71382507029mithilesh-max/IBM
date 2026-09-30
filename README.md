# Infrastructure Automation for Hotel Booking System

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=github-actions)](https://github.com/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform)](https://www.terraform.io/)
[![Ansible](https://img.shields.io/badge/Config-Ansible-EE0000?logo=ansible)](https://www.ansible.com/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?logo=prometheus)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Observability-Grafana-F46800?logo=grafana)](https://grafana.com/)
[![Python](https://img.shields.io/badge/Backend-Flask%203.1-3776AB?logo=python)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev/)

---

## 1. Introduction

**StayEase** is a full-stack, cloud-native hotel booking web application paired with an enterprise-grade infrastructure automation and observability ecosystem.

In traditional monolithic web deployments, hotel booking systems suffer from manual provisioning bottlenecks, configuration drift across application servers, seasonal traffic crashes during holiday peak bookings, and blind spots during service outages. 

This project bridges software engineering with modern DevOps and SRE principles:
- **Declarative Infrastructure:** Entire AWS networking, compute, database, and load balancing are provisioned in minutes via **Terraform**.
- **Automated Configuration:** Host dependencies, Docker runtimes, and security hardening are configured idempotently via **Ansible**.
- **Containerization & Portability:** Development parity is maintained across local environments and cloud instances with **Docker Compose**.
- **Resilience & Elasticity:** High availability is guaranteed via an **AWS Application Load Balancer** and **Auto Scaling Group** governed by CPU and request-rate policies.
- **Continuous Delivery:** Pull requests and production releases are validated, tested, and containerized automatically via **GitHub Actions**.
- **Observability:** Telemetry metrics (latency, HTTP error codes, inventory, DB health) are scraped in real-time by **Prometheus** and visualized in **Grafana**.

---

## 2. Key Features

### 🏨 Hotel Booking Application
- **User Authentication:** Registration, password hashing, and token-based role separation (Customers vs Administrators).
- **Interactive Search Engine:** Filter properties by destination, check-in/out dates, and guest headcount.
- **Dynamic Property Filtering:** Sort by price (low-to-high, high-to-low), guest rating (4.8+, 4.5+, 4.0+), and amenities (Wi-Fi, Pool, Spa, Parking, EV Charging).
- **Detailed Property & Room Showcases:** High-resolution imagery galleries, detailed room specifications, bed types, amenities, and real-time availability.
- **Full Booking & Checkout Workflow:** Automated calculation of nights, rates, taxes, and guest details collection.
- **Simulated Payment Gateway:** Multi-channel simulated payment processing supporting **Credit/Debit Cards**, **UPI**, and **Net Banking** with instant confirmation and reference codes.
- **Reservation Management (My Bookings):** Track booking statuses (`Confirmed`, `Completed`, `Cancelled`), view receipt details, and cancel reservations.
- **Admin Control Center:**
  - Executive KPI statistics cards: Total Users, Total Hotels, Total Rooms, Total Bookings, and Total Revenue.
  - Interactive performance charts: Revenue & Bookings by Hotel and Booking Status Proportions.
  - Complete CRUD management for hotel properties and room categories.
  - Booking search and live status modifications.

### ⚙️ Infrastructure Automation & Observability
- **Infrastructure as Code (IaC):** Modular Terraform configs for VPC, Multi-AZ subnets, Security Groups, IAM, EC2 Launch Templates, ALB, Auto Scaling, and RDS MySQL.
- **Configuration Management:** Ansible inventory, roles (`common`, `docker`, `app_deploy`, `monitoring`), and group variables.
- **Multi-Container Docker Architecture:** Multi-stage Dockerfiles for React (Nginx) and Flask (Gunicorn) with internal MySQL networking.
- **High-Performance Load Balancing:** Traffic distribution with automated `/health` probes.
- **Elastic Auto Scaling:** Dynamic target tracking scaling policies trigger additional server capacity when CPU exceeds 70% or request rates spike.
- **Comprehensive Monitoring:** Prometheus metrics exposition (`/metrics`), alerting rules, and Grafana dashboard (`Hotel Booking Infrastructure Monitoring`).
- **Disaster Recovery:** Automated backup shell scripts with retention rotations and point-in-time restoration procedures.

---

## 3. High-Level Architecture

```text
                                  USERS & CLIENTS
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │   AWS Load Balancer     │ (Port 80 / 443)
                            │   (Health: /health)     │
                            └────────────┬────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
      ┌─────────────────────┐                         ┌─────────────────────┐
      │  App Instance 1     │                         │  App Instance 2     │
      │  (Docker Compose)   │                         │  (Docker Compose)   │
      │ ┌─────────────────┐ │                         │ ┌─────────────────┐ │
      │ │ Nginx Frontend  │ │                         │ │ Nginx Frontend  │ │
      │ └────────┬────────┘ │                         │ └────────┬────────┘ │
      │          ▼          │                         │          ▼          │
      │ ┌─────────────────┐ │                         │ ┌─────────────────┐ │
      │ │ Flask REST API  │ │                         │ │ Flask REST API  │ │
      │ └────────┬────────┘ │                         │ └────────┬────────┘ │
      └──────────┼──────────┘                         └──────────┼──────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                            ┌─────────────────────────┐
                            │    MySQL 8.0 Database   │ (RDS / Container)
                            │    (hotel_booking_db)   │
                            └─────────────────────────┘
                                         ▲
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
    ┌─────────────────────────┐                     ┌─────────────────────────┐
    │   Prometheus Scraper    │◄─── [/metrics] ──── │    Grafana Dashboard    │
    │  (Port 9090 - Alerts)   │                     │  (Port 3001 - Metrics)  │
    └─────────────────────────┘                     └─────────────────────────┘
```

### Automation Workflows
- **Terraform:** Cloud Infrastructure Provisioning (`VPC` &rarr; `Subnets` &rarr; `ALB` &rarr; `ASG` &rarr; `RDS`)
- **Ansible:** Server Configuration (`Docker Install` &rarr; `App Deploy` &rarr; `Exporters`)
- **GitHub Actions:** CI/CD Pipeline (`Lint/Test` &rarr; `Docker Build & Push` &rarr; `Deploy` &rarr; `Verify`)
- **Prometheus & Grafana:** Continuous Telemetry (`Scrape /metrics` &rarr; `Alert on SLA` &rarr; `Dashboard`)

---

## 4. Project Folder Structure

```text
hotel-booking-infrastructure/
├── frontend/                     # React.js SPA Client
│   ├── src/
│   │   ├── components/           # Navbar, Footer, HotelCard, RoomCard, SearchBar, Modals
│   │   ├── pages/                # Home, HotelList, HotelDetail, Bookings, Admin, Auth
│   │   ├── context/              # AuthContext (state & tokens)
│   │   ├── services/             # api.js REST client
│   │   ├── App.jsx               # Main React Application
│   │   ├── index.jsx             # React DOM root
│   │   └── index.css             # Design System & Styling
│   ├── public/                   # HTML Template & Assets
│   ├── package.json              # NPM dependencies & scripts
│   ├── nginx.conf                # Production reverse proxy config
│   └── Dockerfile                # Multi-stage build container
│
├── backend/                      # Python Flask REST API
│   ├── app/                      # Application factory & init
│   ├── routes/                   # Auth, Hotels, Rooms, Bookings, Payments, Admin, Health
│   ├── models/                   # User, Hotel, Room, Booking, Payment data models
│   ├── services/                 # Database abstraction (MySQL + SQLite fallback), Metrics
│   ├── config/                   # Environment & configuration loaders
│   ├── static/                   # Standalone browser-ready distribution
│   ├── requirements.txt          # Python dependencies
│   ├── app.py                    # Entry point runner
│   └── Dockerfile                # Production Python 3.11 container
│
├── database/                     # Database Definitions & Seeds
│   ├── schema.sql                # MySQL 8.0 schema DDL
│   └── seed.sql                  # Realistic sample data (8 hotels, rooms, bookings)
│
├── docker/
│   └── docker-compose.yml        # Development & production compose file
│
├── terraform/                    # AWS Infrastructure as Code
│   ├── providers.tf              # AWS provider setup
│   ├── variables.tf              # Input variables
│   ├── outputs.tf                # DNS, ALB, and endpoint outputs
│   ├── main.tf                   # Master coordination
│   ├── networking.tf             # VPC, Multi-AZ subnets, NAT, IGW
│   ├── compute.tf                # Security groups, Launch templates, IAM
│   ├── load_balancer.tf          # Application Load Balancer & Target Groups
│   ├── auto_scaling.tf           # ASG, CPU target tracking policies
│   ├── database.tf               # RDS MySQL instance & backup policies
│   ├── terraform.tfvars.example  # Example values file
│   └── modules/                  # Reusable VPC, EC2, and ALB modules
│
├── ansible/                      # Server Configuration Management
│   ├── inventory                 # Host inventories
│   ├── playbook.yml              # Master automation playbook
│   ├── group_vars/all.yml        # Global variables
│   └── roles/                    # common, docker, app_deploy, monitoring
│
├── monitoring/                   # Observability Stack
│   ├── prometheus/
│   │   ├── prometheus.yml        # Scraper configuration
│   │   └── alert_rules.yml       # Down, latency, and error alerts
│   └── grafana/
│       ├── provisioning/         # Automated datasource & dashboard provisioning
│       └── dashboards/           # Hotel Booking Infrastructure JSON dashboard
│
├── backup_recovery/              # Business Continuity & Disaster Recovery
│   ├── backup.sh                 # Logical dump & S3 sync script
│   ├── restore.sh                # Interactive restoration script
│   └── RECOVERY_PROCEDURE.md     # RPO/RTO & failover documentation
│
├── .github/workflows/deploy.yml  # GitHub Actions CI/CD pipeline
├── .env.example                  # Environment variable blueprint
├── docker-compose.yml            # Root level compose file
├── run_local.py                  # Single-command Python local runner
├── README.md                     # Comprehensive project documentation
└── LICENSE                       # MIT License
```

---

## 5. Local Setup Instructions

### Option A: Instant Local Run (Python)
The project includes an automatic fallback database and built-in static frontend distribution, enabling you to launch and test the full application immediately without external dependencies:

1. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```
2. **Launch the application:**
   ```bash
   python run_local.py
   ```
   *(On Windows with Python launcher: `py run_local.py`)*
3. **Access endpoints in your browser:**
   - **Web Application:** `http://localhost:5000`
   - **Health Check:** `http://localhost:5000/health`
   - **Prometheus Metrics:** `http://localhost:5000/metrics`

---

### Option B: Full Multi-Container Run (Docker Compose)
To demonstrate the full microservices stack including **MySQL 8.0**, **Backend API**, **React/Nginx Frontend**, **Prometheus**, and **Grafana**:

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```
2. **Start all services with Docker Compose:**
   ```bash
   docker compose up -d --build
   ```
3. **Verify running containers:**
   ```bash
   docker compose ps
   ```
4. **Access the distributed services:**
   | Service | Port | Description |
   | :--- | :--- | :--- |
   | **StayEase Web Client** | `http://localhost:80` | Production React Frontend via Nginx |
   | **Flask REST API** | `http://localhost:5000` | Backend API, Health & Prometheus endpoint |
   | **MySQL 8.0 Database** | `localhost:3306` | Relational database with pre-seeded data |
   | **Prometheus Metrics** | `http://localhost:9090` | Time-series scraper & alert engine |
   | **Grafana Dashboard** | `http://localhost:3001` | Infrastructure Monitoring Dashboard (`admin` / `admin_grafana_2026`) |

---

## 6. Cloud Deployment (Terraform & Ansible)

### Step 1: Provision AWS Infrastructure with Terraform
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Update credentials and preferences in terraform.tfvars

terraform init
terraform plan
terraform apply -auto-approve
```
*Outputs generated will display the public Application Load Balancer DNS (`alb_dns_name`) and database endpoint.*

### Step 2: Configure Compute Servers with Ansible
```bash
cd ../ansible
# Update ansible/inventory with newly provisioned EC2 private/public IPs

ansible-playbook -i inventory playbook.yml
```
*Ansible installs Docker, pulls images, configures environment files, starts containers, and validates the `/health` endpoint.*

---

## 7. CI/CD Pipeline (GitHub Actions)

The workflow `.github/workflows/deploy.yml` triggers automatically on every push or pull request to the `main` branch:

```text
[ Push to main ]
       │
       ▼
1. Checkout & Setup Python
       │
       ▼
2. Automated Tests (Smoke tests on /health, /api/hotels, /metrics)
       │
       ▼
3. Docker Buildx (Compile & push frontend + backend to GitHub Container Registry)
       │
       ▼
4. Continuous Deployment (Trigger Ansible rolling release)
       │
       ▼
5. Automated Health Check Gate (Verify HTTP 200 on Load Balancer endpoint)
```

---

## 8. Monitoring & Observability

### Prometheus
- **Endpoint:** `http://localhost:9090` (Local) or `http://localhost:5000/metrics`
- **Tracked Metrics:**
  - `http_requests_total`: Request counts by endpoint and HTTP status.
  - `http_request_duration_seconds`: Response latency histogram.
  - `hotel_database_health_status`: Real-time connectivity state.
  - `hotel_inventory_total` & `hotel_active_bookings_total`: Business metrics.
- **Alert Rules (`alert_rules.yml`):**
  - `HotelBookingAPIDown`: Triggers when API is unreachable for > 30 seconds.
  - `DatabaseConnectionDegraded`: Triggers when DB connection fails.
  - `HighHttpErrorRate`: Triggers if error rate exceeds 5%.

### Grafana Dashboard
- **URL:** `http://localhost:3001` (Credentials: `admin` / `admin_grafana_2026`)
- **Dashboard:** *Hotel Booking Infrastructure Monitoring*
- **Visual Panels:**
  - Real-time API & Database SLA status pills
  - Active Bookings & Hotel Inventory counters
  - Incoming Request Rate (req/sec) timeseries
  - 95th Percentile Application Latency
  - CPU Utilization & Memory Utilization gauges
  - Network Traffic throughput

---

## 9. Academic Project Demonstration Flow (Step-by-Step)

Follow this 20-step sequence during your academic presentation:

1. **Open Website:** Open `http://localhost:5000` (or `http://localhost:80`) & show the modern, responsive "StayEase" UI.
2. **Show Health Badge:** Highlight the live `API: HEALTHY` indicator in the top navbar.
3. **Register/Login:** Log in with the pre-filled demo guest account (`alex.morgan@example.com` / `user123`).
4. **Search Hotels:** Enter destination `Miami` or `Aspen`, select dates, and click **Search Hotels**.
5. **Show Hotel Listings:** Demonstrate filtering by price range slider, star rating (4.8+), and sorting by price.
6. **Open Hotel Details:** Click **View Details** on *The Grand Azure Resort & Spa*.
7. **View Gallery & Amenities:** Click through the photo gallery and examine listed amenities.
8. **Select Room:** Choose the *Deluxe Oceanfront King Suite* and click **Book Room**.
9. **Review Stay & Enter Info:** Review automatic nights calculation, 12% estimated taxes, and guest details.
10. **Simulated Payment:** Select payment method (**Credit/Debit Card**, **UPI**, or **Net Banking**) and click **Confirm Payment**.
11. **Show Confirmation Page:** Review generated Booking ID (`STE-2026-XXXX`) and transaction reference.
12. **Open My Bookings:** Verify the newly created reservation in the user history table.
13. **Cancel a Reservation:** Demonstrate cancelling a booking and watch the status update to `Cancelled`.
14. **Switch to Admin Account:** Log out and log in as `admin@stayease.com` / `admin123`.
15. **Open Admin Dashboard:** Show the live KPI stats (Total Revenue, Bookings, Inventory) and performance charts.
16. **Show Docker Containers:** Run `docker compose ps` to prove multi-container isolation.
17. **Show Terraform Code:** Walk through `terraform/networking.tf`, `compute.tf`, `load_balancer.tf`, and `auto_scaling.tf`.
18. **Show Ansible Automation:** Explain the playbook and roles in `ansible/playbook.yml`.
19. **Show Prometheus & Grafana:** Open `http://localhost:5000/metrics` and the Grafana dashboard at `http://localhost:3001`.
20. **Demonstrate Health Check:** Open `/health` in browser or curl to show automated JSON health response.

---

## 10. Security & Best Practices

- **Password Security:** PBKDF2/SHA-256 cryptographic password hashing.
- **Access Control:** Role-Based Access Control (RBAC) separating administrative actions from customer reservations.
- **Secrets Management:** Environment variables via `.env`; no hard-coded credentials committed.
- **Input Validation & Sanitization:** SQL injection protected using parameterized SQL queries across MySQL and SQLite engines.
- **CORS Configured:** Granular origins allowed for frontend API interactions.

---

## 11. Future Enhancements

- Integration with production payment gateways (Stripe, Razorpay).
- Email & SMS transaction notifications via AWS SES / SNS.
- Machine Learning recommendation engine for personalized hotel deals.
- Multi-Region active-active replication with AWS Route 53 latency routing.

---

## 12. License

This project is licensed under the [MIT License](LICENSE).
