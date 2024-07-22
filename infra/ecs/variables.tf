variable "app_name" {
  type = string
}

variable "app_route" {
  type = string
}

variable "app_priority" {
  type = number
}

variable "ecs_cluster" {
  type = object({
    name = string
    id   = string
  })
}

variable "alb_id" {
  type = string
}

variable "execution_role_arn" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "security_group_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "app_image" {
  description = "Docker image to run in the ECS cluster"
}

variable "app_port" {
  description = "Port exposed by the docker image to redirect traffic to"
}

variable "lb_port" {
  description = "Port exposed to the pubic internet for the load balancer"
}

variable "app_count" {
  description = "Number of containers to run"
}

variable "health_check_path" {
  type = string
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
}
