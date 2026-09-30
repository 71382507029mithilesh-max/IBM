# ==========================================================
# StayEase Hotel Booking - RDS MySQL Database Infrastructure
# ==========================================================

# 1. DB Subnet Group across isolated database subnets
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "stayease-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name = "stayease-db-subnet-group"
  }
}

# 2. Managed MySQL 8.0 RDS Instance
resource "aws_db_instance" "mysql" {
  identifier        = "stayease-mysql-db"
  engine            = "mysql"
  engine_version    = "8.0.35"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  max_allocated_storage = 100
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  multi_az = false # Set to true for production high-availability multi-region failover

  # Automated Backups & Disaster Recovery
  backup_retention_period   = 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:30-sun:05:30"
  auto_minor_version_upgrade = true
  skip_final_snapshot       = true
  deletion_protection       = false

  tags = {
    Name = "stayease-mysql-instance"
    Tier = "Database"
  }
}
