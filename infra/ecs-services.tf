resource "aws_ecs_cluster" "main" {
  name = "martletplace-cluster"
}

resource "aws_alb" "main" {
  name            = "martletplace-load-balancer"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
}

module "user" {
  source = "./ecs/"

  app_name     = "user"
  app_image    = aws_ecr_repository.main["user"].repository_url
  app_port     = 8211
  app_route    = "/api/user*"
  app_priority = 99

  environment = [
    {
      name  = "OTEL_COLLECTOR_ENDPOINT",
      value = "http://localhost"
    },
    {
      name  = "EMAIL_ENDPOINT",
      value = "test"
    },
    {
      name  = "JWT_PUBLIC_KEY",
      value = "test"
    },
    {
      name  = "JWT_PRIVATE_KEY",
      value = "test"
    },
    {
      name  = "SKIP_USER_VERIFICATION",
      value = "TRUE"
    },
    {
      name  = "JWT_PUBLIC_KEY",
      value = tls_private_key.jwt_key.public_key_pem
    }
  ]
  secrets = [
    {
      name      = "DB_ENDPOINT",
      valueFrom = aws_secretsmanager_secret.database_url_secret.arn
    },
    {
      name      = "JWT_PRIVATE_KEY",
      valueFrom = aws_secretsmanager_secret.jwt_private_key_secret.arn
    },
  ]

  fargate_cpu    = var.fargate_cpu
  fargate_memory = var.fargate_memory
  app_count      = var.app_count

  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  lb_port            = var.lb_port
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "frontend" {
  source = "./ecs/"

  app_name     = "frontend"
  app_image    = aws_ecr_repository.main["frontend"].repository_url
  app_port     = 8101
  app_route    = "*"
  app_priority = 1000

  environment = []
  secrets     = []

  fargate_cpu    = var.fargate_cpu
  fargate_memory = var.fargate_memory
  app_count      = var.app_count

  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  lb_port            = var.lb_port
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}
