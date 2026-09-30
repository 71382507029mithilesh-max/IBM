# StayEase - Backup and Disaster Recovery Procedure

This document outlines the backup, storage, and disaster recovery strategy for the **StayEase Hotel Booking System**, detailing how data resilience protects business operations against hardware outages, availability zone failures, accidental deletions, and database corruption.

---

## 1. Backup Strategy Overview

| Tier | Frequency | Tool / Mechanism | Retention Policy | Storage Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Automated RDS Snapshots** | Daily (03:00 UTC) | AWS RDS Automated Backups | 7 to 30 Days | Encrypted AWS RDS Storage |
| **Logical MySQL Dumps** | Every 6 Hours | `mysqldump` via cron (`backup.sh`) | 7 Days Local, 90 Days Cloud | Local `/opt/stayease/backups` + AWS S3 |
| **Transaction Logs (Binlogs)** | Continuous | MySQL Binary Logging | 7 Days | Local / RDS S3 Archive |

---

## 2. Disaster Recovery Metrics

- **Recovery Point Objective (RPO):** `< 5 minutes`  
  *Using continuous binary logs and automated snapshots to minimize data loss.*
- **Recovery Time Objective (RTO):** `< 15 minutes`  
  *Automated Terraform redeployment and database point-in-time restore.*

---

## 3. Storage & Encryption

1. **At-Rest Encryption:** Backups stored in AWS S3 are encrypted with AES-256 (`aws:kms` or `AES256`).
2. **Access Control:** Restricted via AWS IAM roles with Principle of Least Privilege. Public access is strictly blocked.
3. **Lifecycle Rule:** S3 Lifecycle shifts backups to **S3 Standard-Infrequent Access** after 30 days and permanently purges them after 90 days.

---

## 4. Step-by-Step Restoration Procedure

### Scenario A: Restoring on Local / On-Premises or Docker Host
1. Locate the desired backup file in `/opt/stayease/backups/`.
2. Stop active application containers to prevent write skew:
   ```bash
   docker compose stop backend frontend
   ```
3. Execute the restoration script:
   ```bash
   ./backup_recovery/restore.sh /opt/stayease/backups/hotel_booking_db_backup_20260930_120000.sql.gz
   ```
4. Restart application containers:
   ```bash
   docker compose start backend frontend
   ```
5. Check health:
   ```bash
   curl -f http://localhost:5000/health
   ```

### Scenario B: Restoring in AWS Cloud (RDS Point-in-Time Recovery)
1. Navigate to AWS RDS Console &rarr; Databases.
2. Select `stayease-mysql-db` &rarr; Actions &rarr; **Restore to point in time**.
3. Choose the target restoration timestamp (e.g. 5 minutes before the incident).
4. Update Terraform or Route 53 CNAME record to point the application servers to the newly restored RDS endpoint.
5. ALB health checks will automatically verify that application instances connect successfully before routing live traffic.

---

## 5. Resilience Against Infrastructure Failure

When an entire AWS Availability Zone goes offline:
1. **Compute Nodes:** The AWS Auto Scaling Group detects unhealthy nodes and immediately launches replacement EC2 instances in an alternative Availability Zone.
2. **Traffic Re-routing:** The Application Load Balancer distributes incoming customer traffic exclusively to healthy, responsive instances.
3. **Database Failover:** If Multi-AZ is enabled on RDS, synchronous replication triggers an automatic failover to the standby replica within 60 seconds with zero manual intervention required.
