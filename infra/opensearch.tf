variable "domain" {
  default = "martletplace"
}

resource "aws_security_group" "example" {
  name   = "opensearch_sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"

    cidr_blocks = [aws_vpc.main.cidr_block]
  }
}

resource "aws_iam_service_linked_role" "example" {
  aws_service_name = "opensearchservice.amazonaws.com"
}

data "aws_iam_policy_document" "example" {
  statement {
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["es:*"]
    resources = ["arn:aws:es:us-west-2:${data.aws_caller_identity.current.account_id}:domain/${var.domain}/*"]
  }
}

resource "aws_opensearch_domain" "example" {
  domain_name    = var.domain
  engine_version = "OpenSearch_2.13"

  cluster_config {
    instance_type = "m6g.large.search"
    #zone_awareness_enabled = true
    instance_count = 1
  }

  advanced_security_options {
    enabled = true
    #anonymous_auth_enabled         = true
    internal_user_database_enabled = true
    master_user_options {
      master_user_name     = "elastic"
      master_user_password = random_password.search_password.result
    }
  }

  node_to_node_encryption {
    enabled = true
  }

  encrypt_at_rest {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }


  vpc_options {
    subnet_ids         = [aws_subnet.public.1.id] #TODO: Make it all four
    security_group_ids = [aws_security_group.example.id]
  }
  ebs_options {
    ebs_enabled = true
    volume_size = 10
  }

  advanced_options = {
    "rest.action.multi.allow_explicit_index" = "true"
  }

  access_policies = data.aws_iam_policy_document.example.json

  depends_on = [aws_iam_service_linked_role.example]
}

resource "random_password" "search_password" {
  length      = 16
  min_lower   = 1
  min_upper   = 1
  min_numeric = 1
  min_special = 1
}

resource "aws_secretsmanager_secret" "opensearch_password_secret" {
  name                    = "/martletplace/opensearch_url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "opensearch_password_version" {
  secret_id     = aws_secretsmanager_secret.opensearch_password_secret.id
  secret_string = random_password.search_password.result
}
