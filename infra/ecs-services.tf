resource "aws_ecs_cluster" "main" {
  name = "martletplace-cluster"
}

resource "aws_alb" "main" {
  name            = "martletplace-load-balancer"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
}

locals {
  base_environment = [
    {
      name  = "OTEL_COLLECTOR_ENDPOINT",
      value = "http://${aws_alb.main.dns_name}/v1/traces"
    },
    {
      name  = "JWT_PUBLIC_KEY",
      value = tls_private_key.jwt_key.public_key_pem
    },
  ]
  base_secrets = [
    {
      name      = "DB_ENDPOINT",
      valueFrom = aws_secretsmanager_secret.database_url_secret.arn
    },
  ]
}

module "user" {
  source = "./ecs/"

  app_name     = "user"
  app_image    = aws_ecr_repository.main["user"].repository_url
  app_port     = 8211
  app_route    = "/api/user*"
  app_priority = 99

  environment = concat(local.base_environment, [
    {
      name  = "EMAIL_ENDPOINT",
      value = "http://localhost"
    },
    {
      name  = "SKIP_USER_VERIFICATION",
      value = "TRUE"
    },
  ])
  secrets = concat(local.base_secrets, [
    {
      name      = "JWT_PRIVATE_KEY",
      valueFrom = aws_secretsmanager_secret.jwt_private_key_secret.arn
    },
  ])

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

module "listing" {
  source = "./ecs/"

  app_name     = "listing"
  app_image    = aws_ecr_repository.main["listing"].repository_url
  app_port     = 8212
  app_route    = "/api/listing*"
  app_priority = 98

  environment = concat(local.base_environment, [])
  secrets     = concat(local.base_secrets, [])

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

module "review" {
  source = "./ecs/"

  app_name     = "review"
  app_image    = aws_ecr_repository.main["review"].repository_url
  app_port     = 8213
  app_route    = "/api/review*"
  app_priority = 97

  environment = concat(local.base_environment, [])
  secrets     = concat(local.base_secrets, [])

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

module "message" {
  source = "./ecs/"

  app_name     = "message"
  app_image    = aws_ecr_repository.main["message"].repository_url
  app_port     = 8214
  app_route    = "/api/messages*"
  app_priority = 96

  environment = concat(local.base_environment, [])
  secrets     = concat(local.base_secrets, [])

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

module "search" {
  source = "./ecs/"

  app_name     = "search"
  app_image    = aws_ecr_repository.main["search"].repository_url
  app_port     = 8221
  app_route    = "/api/search*"
  app_priority = 95

  environment = concat(local.base_environment, [])
  secrets = concat(local.base_secrets, [{
    name      = "ES_ENDPOINT",
    valueFrom = aws_secretsmanager_secret.opensearch_url_secret.arn
  }])

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

module "collector" {
  source = "./ecs/"

  app_name         = "collector"
  app_image        = aws_ecr_repository.main["collector"].repository_url
  app_port         = 4318
  app_route        = "/v1/traces*"
  app_priority     = 89
  healthcheck_port = 13133

  environment = concat(local.base_environment, [])
  secrets     = concat(local.base_secrets, [])

  fargate_cpu    = var.fargate_cpu
  fargate_memory = var.fargate_memory
  app_count      = 1

  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  lb_port            = var.lb_port
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}
