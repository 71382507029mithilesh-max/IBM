# ==========================================================
# StayEase - Infrastructure Automation for Hotel Booking System
# Master Terraform Orchestration
# ==========================================================

# Current AWS Account and Caller Details
data "aws_caller_identity" "current" {}

locals {
  name_prefix = "stayease-${var.environment}"
  common_tags = {
    Project     = "Infrastructure Automation for Hotel Booking System"
    Application = "StayEase"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "DevOps Engineering"
  }
}

# The modular infrastructure is organized into:
# - networking.tf     : VPC, Multi-AZ subnets, IGW, NAT Gateways, Route Tables
# - compute.tf        : Security groups, IAM policies, AMI lookup, Launch Template
# - load_balancer.tf  : Application Load Balancer, Target Groups, /health listener
# - auto_scaling.tf   : Auto Scaling Group (min 2, max 6), Target Tracking policies
# - database.tf       : Subnet Group, RDS MySQL 8.0 instance, backup retention
