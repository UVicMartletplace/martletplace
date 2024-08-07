resource "aws_rds_cluster" "db_cluster" {
  cluster_identifier              = "martletplace"
  engine                          = "aurora-postgresql"
  engine_mode                     = "provisioned"
  engine_version                  = "16.2"
  database_name                   = "martletplace"
  master_username                 = "martletplace"
  master_password                 = random_password.database_password.result
  storage_encrypted               = true
  vpc_security_group_ids          = [aws_security_group.rds_security_group.id]
  db_subnet_group_name            = aws_db_subnet_group.database_subnet_group.name
  skip_final_snapshot             = true
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.default.name
  depends_on                      = [aws_rds_cluster_parameter_group.default]

  serverlessv2_scaling_configuration {
    max_capacity = 1.0
    min_capacity = 0.5
  }
}

resource "aws_rds_cluster_instance" "serverless_db" {
  cluster_identifier   = aws_rds_cluster.db_cluster.id
  instance_class       = "db.serverless"
  engine               = aws_rds_cluster.db_cluster.engine
  engine_version       = aws_rds_cluster.db_cluster.engine_version
  db_subnet_group_name = aws_db_subnet_group.database_subnet_group.name
  publicly_accessible  = true
}

resource "aws_rds_cluster_parameter_group" "default" {
  name   = "logical-cluster-replication"
  family = "aurora-postgresql16"

  parameter {
    name         = "rds.logical_replication"
    value        = "1"
    apply_method = "pending-reboot"
  }

  lifecycle {
    create_before_destroy = true
  }
}

data "http" "myip" {
  url = "https://ipv4.icanhazip.com"
}

resource "aws_security_group" "rds_security_group" {
  description = "RDS (terraform-managed)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block, "${chomp(data.http.myip.response_body)}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block, "${chomp(data.http.myip.response_body)}/32"]
  }
}

resource "random_password" "database_password" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "database_url_secret" {
  name                    = "/martletplace/database_url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_url_version" {
  secret_id     = aws_secretsmanager_secret.database_url_secret.id
  secret_string = format("postgres://%s:%s@%s/%s", aws_rds_cluster.db_cluster.master_username, random_password.database_password.result, aws_rds_cluster.db_cluster.endpoint, aws_rds_cluster.db_cluster.database_name)
}
