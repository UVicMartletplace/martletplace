resource "aws_rds_cluster" "db_cluster" {
  cluster_identifier     = "martletplace"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned"
  engine_version         = "16.2"
  database_name          = "martletplace"
  master_username        = "martletplace"
  master_password        = random_password.database_password.result
  storage_encrypted      = true
  vpc_security_group_ids = [aws_security_group.rds_security_group.id]
  db_subnet_group_name   = aws_db_subnet_group.database_subnet_group.name
  skip_final_snapshot    = true

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
}

resource "aws_security_group" "rds_security_group" {
  description = "RDS (terraform-managed)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }
}

resource "random_password" "database_password" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "database_password_secret" {
  name                    = "/martletplace/database_password"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_password_version" {
  secret_id     = aws_secretsmanager_secret.database_password_secret.id
  secret_string = format("postgres://%s:%s@%s/%s", aws_rds_cluster.db_cluster.master_username, random_password.database_password.result, aws_rds_cluster.db_cluster.endpoint, aws_rds_cluster.db_cluster.database_name)
}
