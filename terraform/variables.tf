# ==========================================================
# StayEase Hotel Booking System - Terraform Variables
# ==========================================================

variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Target deployment environment (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets across availability zones (ALB & NAT)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets hosting application instances"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDRs for isolated database subnets hosting RDS MySQL"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24"]
}

variable "instance_type" {
  description = "EC2 compute instance type for application nodes"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "EC2 key pair name for SSH administration via Ansible"
  type        = string
  default     = "stayease-keypair"
}

variable "asg_min_size" {
  description = "Minimum count of instances in Auto Scaling Group"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "Maximum capacity of instances under high peak traffic"
  type        = number
  default     = 6
}

variable "asg_desired_capacity" {
  description = "Baseline desired count of active instances"
  type        = number
  default     = 2
}

variable "db_instance_class" {
  description = "RDS instance class for MySQL"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Initial MySQL database name"
  type        = string
  default     = "hotel_booking_db"
}

variable "db_username" {
  description = "Master username for RDS MySQL"
  type        = string
  default     = "hotel_admin"
}

variable "db_password" {
  description = "Master password for RDS MySQL (supplied securely via tfvars/secrets)"
  type        = string
  sensitive   = true
  default     = "SecureHotelPass2026!Aws"
}
