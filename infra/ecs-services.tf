resource "aws_ecs_cluster" "main" {
  name = "martletplace-cluster"
}

resource "aws_alb" "main" {
  name            = "martletplace-load-balancer"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
}

module "ecs" {
  source = "./ecs/"

  app_name           = "echo"
  fargate_cpu        = var.fargate_cpu
  fargate_memory     = var.fargate_memory
  app_count          = var.app_count
  app_port           = 3000
  app_image          = "registry.gitlab.com/architect-io/artifacts/nodejs-hello-world:latest"
  ecs_cluster        = aws_ecs_cluster.main
  alb_id             = aws_alb.main.id
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  vpc_id             = aws_vpc.main.id
  security_group_id  = aws_security_group.ecs_tasks.id
  subnet_ids         = aws_subnet.public.*.id
  health_check_path  = var.health_check_path
  lb_port            = var.lb_port
}
