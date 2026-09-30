variable "name" { type = string }
variable "vpc_id" { type = string }
variable "security_groups" { type = list(string) }
variable "subnets" { type = list(string) }
variable "target_port" { type = number; default = 5000 }
variable "health_check_path" { type = string; default = "/health" }
