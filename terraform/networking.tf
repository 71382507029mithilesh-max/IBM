# ==========================================================
# StayEase Hotel Booking - Networking & VPC Infrastructure
# ==========================================================

data "aws_availability_zones" "available" {
  state = "available"
}

# 1. Dedicated VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "stayease-vpc-${var.environment}"
  }
}

# 2. Internet Gateway for public traffic
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "stayease-igw-${var.environment}"
  }
}

# 3. Public Subnets (For ALB, Bastion & NAT Gateway)
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "stayease-public-subnet-${count.index + 1}"
    Tier = "Public"
  }
}

# 4. Private Subnets (For Hotel Application Instances)
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "stayease-private-app-subnet-${count.index + 1}"
    Tier = "Private-App"
  }
}

# 5. Database Subnets (Isolated for RDS MySQL)
resource "aws_subnet" "database" {
  count             = length(var.database_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "stayease-db-subnet-${count.index + 1}"
    Tier = "Private-DB"
  }
}

# 6. Elastic IP & NAT Gateway (Enables private instances to pull images & updates)
resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name = "stayease-nat-eip"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "stayease-nat-gw"
  }

  depends_on = [aws_internet_gateway.igw]
}

# 7. Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "stayease-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "stayease-private-rt"
  }
}

# 8. Route Table Associations
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
