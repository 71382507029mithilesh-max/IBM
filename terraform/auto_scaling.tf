# ==========================================================
# StayEase Hotel Booking - Auto Scaling Group (ASG) & Policies
# ==========================================================

# 1. Auto Scaling Group across Private Application Subnets
resource "aws_autoscaling_group" "app_asg" {
  name_prefix         = "stayease-asg-"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app_tg.arn]

  min_size     = var.asg_min_size
  max_size     = var.asg_max_size
  desired_capacity = var.asg_desired_capacity

  health_check_type         = "ELB"
  health_check_grace_period = 180

  launch_template {
    id      = aws_launch_template.app_template.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "stayease-asg-node"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# 2. Target Tracking Scaling Policy - Scale Out / In based on 70% CPU target
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "stayease-cpu-target-tracking"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value     = 70.0
    disable_scale_in = false
  }
}

# 3. High Demand Alert Scaling Policy (Step Scaling / High Request Rate)
resource "aws_autoscaling_policy" "alb_request_count" {
  name                   = "stayease-alb-requests-scaling"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.main.arn_suffix}/${aws_lb_target_group.app_tg.arn_suffix}"
    }
    target_value = 1000.0 # Scale out when requests exceed 1,000 reqs/target
  }
}
