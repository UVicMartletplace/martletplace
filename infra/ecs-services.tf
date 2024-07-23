resource "aws_ecs_cluster" "main" {
  name = "martletplace-cluster"
}

resource "aws_alb" "main" {
  name            = "martletplace-load-balancer"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
}

module "echo" {
  source = "./ecs/"

  app_name     = "echo"
  app_image    = "ealen/echo-server"
  app_port     = 80
  app_route    = "/api/echo*"
  app_priority = 99

  fargate_cpu    = var.fargate_cpu
  fargate_memory = var.fargate_memory
  app_count      = var.app_count

  ecs_cluster         = aws_ecs_cluster.main
  alb_id              = aws_alb.main.id
  lb_port             = var.lb_port
  execution_role_arn  = aws_iam_role.ecs_task_execution_role.arn
  vpc_id              = aws_vpc.main.id
  security_group_id   = aws_security_group.ecs_tasks.id
  subnet_ids          = aws_subnet.public.*.id
  health_check_path   = var.health_check_path
  database_secret_arn = aws_secretsmanager_secret.database_password_secret.arn
}

module "hello" {
  source = "./ecs/"

  app_name     = "hello"
  app_image    = "ealen/echo-server"
  app_port     = 80
  app_route    = "/api/hello*"
  app_priority = 98

  fargate_cpu    = var.fargate_cpu
  fargate_memory = var.fargate_memory
  app_count      = var.app_count

  ecs_cluster         = aws_ecs_cluster.main
  alb_id              = aws_alb.main.id
  lb_port             = var.lb_port
  execution_role_arn  = aws_iam_role.ecs_task_execution_role.arn
  vpc_id              = aws_vpc.main.id
  security_group_id   = aws_security_group.ecs_tasks.id
  subnet_ids          = aws_subnet.public.*.id
  health_check_path   = var.health_check_path
  database_secret_arn = aws_secretsmanager_secret.database_password_secret.arn
}
