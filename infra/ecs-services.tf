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

module "frontend" {
  source = "./ecs/"

  app_name     = "frontend"
  app_image    = format("%s:%s", aws_ecr_repository.main["frontend"].repository_url, var.app_version)
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
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "user" {
  source = "./ecs/"

  app_name     = "user"
  app_image    = format("%s:%s", aws_ecr_repository.main["user"].repository_url, var.app_version)
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
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "listing" {
  source = "./ecs/"

  app_name     = "listing"
  app_image    = format("%s:%s", aws_ecr_repository.main["listing"].repository_url, var.app_version)
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
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "review" {
  source = "./ecs/"

  app_name     = "review"
  app_image    = format("%s:%s", aws_ecr_repository.main["review"].repository_url, var.app_version)
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
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "message" {
  source = "./ecs/"

  app_name     = "message"
  app_image    = format("%s:%s", aws_ecr_repository.main["message"].repository_url, var.app_version)
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
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "search" {
  source = "./ecs/"

  app_name     = "search"
  app_image    = format("%s:%s", aws_ecr_repository.main["search"].repository_url, var.app_version)
  app_port     = 8221
  app_route    = "/api/search*"
  app_priority = 95

  environment = concat(local.base_environment, [{
    name  = "ES_ENDPOINT",
    value = format("https://%s", aws_opensearch_domain.example.endpoint)
  }])

  secrets = concat(local.base_secrets, [{
    name      = "ES_PASSWORD",
    valueFrom = aws_secretsmanager_secret.opensearch_password_secret.arn
  }])

  fargate_cpu    = var.fargate_cpu
  fargate_memory = var.fargate_memory
  app_count      = var.app_count

  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  lb_port            = var.lb_port
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "pgsync" {
  source = "./ecs/"

  app_name     = "pgsync"
  app_image    = format("%s:%s", aws_ecr_repository.main["pgsync"].repository_url, var.app_version)
  app_port     = 8221
  app_route    = "/hidden/pgsync"
  app_priority = 55

  environment = concat(local.base_environment, [
    {
      name  = "PG_HOST",
      value = aws_rds_cluster.db_cluster.endpoint
    },
    {
      name  = "PG_PORT",
      value = 5432
    },
    {
      name  = "PG_USER",
      value = aws_rds_cluster.db_cluster.master_username
    },
    {
      name  = "PG_PASSWORD",
      value = aws_rds_cluster.db_cluster.master_password
    },
    {
      name  = "ELASTICSEARCH_HOST",
      value = aws_opensearch_domain.example.endpoint
    },
    {
      name  = "ELASTICSEARCH_PORT",
      value = 443
    },
    {
      name  = "ELASTICSEARCH_USER",
      value = aws_opensearch_domain.example.advanced_security_options[0].master_user_options[0].master_user_name
    },
    {
      name  = "ELASTICSEARCH_SCHEME",
      value = "https"
    },
  ])

  secrets = concat(local.base_secrets, [{
    name      = "ELASTICSEARCH_PASSWORD",
    valueFrom = aws_secretsmanager_secret.opensearch_password_secret.arn
  }])

  fargate_cpu    = 512
  fargate_memory = 1024
  app_count      = 1

  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  lb_port            = var.lb_port
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "recommend" {
  source = "./ecs/"

  app_name     = "recommend"
  app_image    = format("%s:%s", aws_ecr_repository.main["recommend"].repository_url, var.app_version)
  app_port     = 8222
  app_route    = "/api/recommendations*"
  app_priority = 89

  environment = concat(local.base_environment, [])
  secrets     = concat(local.base_secrets, [])

  fargate_cpu    = 512
  fargate_memory = 2048
  app_count      = var.app_count

  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  lb_port            = var.lb_port
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}

module "collector" {
  source = "./ecs/"

  app_name         = "collector"
  app_image        = format("%s:%s", aws_ecr_repository.main["collector"].repository_url, var.app_version)
  app_port         = 4318
  app_route        = "/v1/traces*"
  app_priority     = 59
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
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
}
