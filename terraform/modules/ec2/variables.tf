variable "name" { type = string }
variable "instance_count" { type = number; default = 2 }
variable "ami_id" { type = string }
variable "instance_type" { type = string; default = "t3.medium" }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "key_name" { type = string }
