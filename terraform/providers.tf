# ==========================================================
# StayEase Hotel Booking System - Terraform AWS Providers
# ==========================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30.0"
    }
  }

  # Example remote S3 backend for team state locking:
  # backend "s3" {
  #   bucket         = "stayease-terraform-state-bucket"
  #   key            = "prod/hotel-booking/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "stayease-tf-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Infrastructure Automation for Hotel Booking System"
      Application = "StayEase"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
