variable "app_name" {
  type    = string
  default = "user"
}

variable "app_image" {
  description = "Docker image to run in the ECS cluster"
  default     = "registry.gitlab.com/architect-io/artifacts/nodejs-hello-world:latest"
}

variable "app_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 3000
}

variable "lb_port" {
  description = "Port exposed to the pubic internet for the load balancer"
  default     = 80
}

variable "app_count" {
  description = "Number of containers to run"
  default     = 2
}

variable "health_check_path" {
  default = "/" #"/.well-known/health"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = 256
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = 512
}
