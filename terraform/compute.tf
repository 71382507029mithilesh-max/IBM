# ==========================================================
# StayEase Hotel Booking - Compute & Security Groups
# ==========================================================

# 1. Security Group: Application Load Balancer
resource "aws_security_group" "alb" {
  name        = "stayease-alb-sg"
  description = "Allow inbound HTTP/HTTPS from Internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP Public Access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Public Access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "stayease-alb-sg"
  }
}

# 2. Security Group: Application Instances (EC2)
resource "aws_security_group" "app" {
  name        = "stayease-app-sg"
  description = "Allow traffic exclusively from ALB and SSH for Ansible management"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Traffic from ALB"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Frontend Web Traffic from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description = "Ansible / Admin SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Restricted to internal VPC / bastion
  }

  ingress {
    description = "Prometheus Metrics Scraping"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "stayease-app-sg"
  }
}

# 3. Security Group: Database (RDS MySQL)
resource "aws_security_group" "db" {
  name        = "stayease-db-sg"
  description = "Allow MySQL connectivity solely from application servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from App Instances"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "stayease-db-sg"
  }
}

# 4. IAM Role & Instance Profile for EC2 Instances
resource "aws_iam_role" "app_role" {
  name = "stayease-ec2-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.app_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "app_profile" {
  name = "stayease-instance-profile"
  role = aws_iam_role.app_role.name
}

# 5. Ubuntu AMI Lookup
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# 6. EC2 Launch Template for Hotel Booking Nodes
resource "aws_launch_template" "app_template" {
  name_prefix   = "stayease-lt-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.app_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.app.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose curl git
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "stayease-app-node"
      Role = "HotelBookingServer"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}
