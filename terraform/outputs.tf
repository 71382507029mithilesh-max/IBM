# ==========================================================
# StayEase Hotel Booking - Terraform Outputs
# ==========================================================

output "alb_dns_name" {
  description = "Public URL endpoint for the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Canonical hosted zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

output "vpc_id" {
  description = "Identifier of the created VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnets hosting ingress resources"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnets hosting application EC2 instances"
  value       = aws_subnet.private[*].id
}

output "asg_name" {
  description = "Auto Scaling Group Name"
  value       = aws_autoscaling_group.app_asg.name
}

output "database_endpoint" {
  description = "MySQL RDS connection endpoint hostname"
  value       = aws_db_instance.mysql.endpoint
}

output "health_check_url" {
  description = "Public URL for application health check"
  value       = "http://${aws_lb.main.dns_name}/health"
}

output "metrics_url" {
  description = "Public URL for Prometheus metrics"
  value       = "http://${aws_lb.main.dns_name}/metrics"
}
