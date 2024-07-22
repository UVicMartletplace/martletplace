resource "aws_rds_cluster" "db_cluster" {
  cluster_identifier     = "martletplace"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned"
  engine_version         = "16.2"
  database_name          = "db_name"
  master_username        = "master_user"
  master_password        = aws_secretsmanager_secret_version.database_password_version.secret_string
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
  # name = "${local.resource_name_prefix}-rds-sg"

  description = "RDS (terraform-managed)"
  vpc_id      = aws_vpc.main.id

  # Only MySQL in
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  # Allow all outbound traffic.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }
}
