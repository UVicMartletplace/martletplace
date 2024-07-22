resource "aws_rds_cluster" "db_cluster" {
  cluster_identifier     = "martletplace"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned"
  engine_version         = "16.2"
  database_name          = "db_name"
  master_username        = "master_user"
  master_password        = "the_master_password"
  storage_encrypted      = true
  vpc_security_group_ids = [aws_security_group.rds_security_group.id]

  serverlessv2_scaling_configuration {
    max_capacity = 1.0
    min_capacity = 0.5
  }
}

resource "aws_rds_cluster_instance" "serverless_db" {
  cluster_identifier = aws_rds_cluster.db_cluster.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.db_cluster.engine
  engine_version     = aws_rds_cluster.db_cluster.engine_version
}

resource "aws_security_group" "rds_security_group" {
  # name = "${local.resource_name_prefix}-rds-sg"

  description = "RDS (terraform-managed)"
  vpc_id      = aws_vpc.main.id

  # Only MySQL in
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "tcp"
    # cidr_blocks = var.sg_ingress_cidr_block
  }

  # Allow all outbound traffic.
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # cidr_blocks = var.sg_egress_cidr_block
  }
}
