resource "aws_ecs_task_definition" "app" {
  family             = "martletplace-${var.app_name}-task"
  execution_role_arn = var.execution_role_arn
  network_mode       = "awsvpc"
  cpu                = var.fargate_cpu
  memory             = var.fargate_memory
  container_definitions = jsonencode([
    {
      name      = "martletplace-${var.app_name}",
      image     = var.app_image,
      cpu       = var.fargate_cpu,
      memory    = var.fargate_memory,
      essential = true,
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/ecs/martletplace/${var.app_name}",
          awslogs-region        = "us-west-2",
          awslogs-stream-prefix = "ecs"
        }
      },
      portMappings = [
        {
          containerPort = var.app_port,
          hostPort      = var.app_port
        }
      ],
      secrets = [
        {
          name      = "DB_ENDPOINT",
          valueFrom = var.database_secret_arn
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "main" {
  name            = "martletplace-${var.app_name}"
  cluster         = var.ecs_cluster.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count

  network_configuration {
    security_groups  = [var.security_group_id]
    subnets          = var.subnet_ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.app.id
    container_name   = "martletplace-${var.app_name}"
    container_port   = var.app_port
  }

  capacity_provider_strategy {
    base              = 1
    capacity_provider = "FARGATE"
    weight            = 0
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 100
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  #depends_on = [aws_alb_listener.front_end, aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]
}

####
# Loadbalancer
####
resource "aws_alb_target_group" "app" {
  name        = "${var.app_name}-target-group"
  port        = var.lb_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }
}

# Redirect all traffic from the ALB to the target group
resource "aws_alb_listener" "front_end" {
  load_balancer_arn = var.alb_id
  port              = var.lb_port
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "404 Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "host_based_weighted_routing" {
  listener_arn = aws_alb_listener.front_end.arn
  priority     = var.app_priority

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = [var.app_route]
    }
  }
}

####
# Autoscaling
####
resource "aws_appautoscaling_target" "target" {
  service_namespace  = "ecs"
  resource_id        = "service/${var.ecs_cluster.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 6

  depends_on = [aws_ecs_service.main]
}

resource "aws_appautoscaling_policy" "ecs_target_cpu" {
  name               = "application-scaling-policy-cpu"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.target.service_namespace
  resource_id        = aws_appautoscaling_target.target.resource_id
  scalable_dimension = aws_appautoscaling_target.target.scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 80
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "ecs_target_memory" {
  name               = "application-scaling-policy-memory"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.target.resource_id
  scalable_dimension = aws_appautoscaling_target.target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value       = 80
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

####
# Logs
####
resource "aws_cloudwatch_log_group" "martletplace_log_group" {
  name              = "/ecs/martletplace/${var.app_name}"
  retention_in_days = 1
}

resource "aws_cloudwatch_log_stream" "martletplace_log_stream" {
  name           = "martletplace-${var.app_name}-logs"
  log_group_name = aws_cloudwatch_log_group.martletplace_log_group.name
}
