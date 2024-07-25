resource "aws_opensearchserverless_collection" "martletplace-collection" {
  name = "martletplace-collection"
  type = "SEARCH"

  depends_on = [
    aws_opensearchserverless_security_policy.opensearch-encryption-policy,
    aws_opensearchserverless_security_policy.opensearch-network-policy,
    aws_opensearchserverless_access_policy.opensearch-access-policy,
  ]
}

resource "aws_opensearchserverless_security_policy" "opensearch-network-policy" {
  name = "opensearch-network-policy"
  type = "network"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection",
          Resource     = ["collection/martletplace*"]
        },
      ],
      AllowFromPublic = false,
      SourceVPCEs     = [aws_opensearchserverless_vpc_endpoint.martetplace-opensearch-endpoint.id]
    }
  ])
}

resource "aws_opensearchserverless_security_policy" "opensearch-encryption-policy" {
  name = "opensearch-encryption-policy"
  type = "encryption"
  policy = jsonencode({
    "Rules" = [
      {
        "Resource" = [
          "collection/martletplace*"
        ],
        "ResourceType" = "collection"
      }
    ],
    "AWSOwnedKey" = true
  })
}

resource "aws_opensearchserverless_access_policy" "opensearch-access-policy" {
  name        = "opensearch-access-policy"
  type        = "data"
  description = "read and write permissions"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "index",
          Resource = [
            "index/martletplace-collection/*"
          ],
          Permission = [
            "aoss:*"
          ]
        },
        {
          ResourceType = "collection",
          Resource = [
            "collection/martletplace-collection"
          ],
          Permission = [
            "aoss:*"
          ]
        }
      ],
      Principal = [
        data.aws_caller_identity.current.arn,
        aws_iam_role.ecs_task_execution_role.arn
      ]
    }
  ])
}

resource "aws_security_group" "opensearch_security_group" {
  name        = "opensearch_security_group"
  description = "Security group for VPC endpoint"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 65000
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
    description = "Allow inbound traffic from EC2 instances in 10.0.0.0/8"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block]
    description = "Allow outbound traffic to EC2 instances in 10.0.0.0/8"
  }
}

resource "aws_opensearchserverless_vpc_endpoint" "martetplace-opensearch-endpoint" {
  name               = "martetplace-opensearch-endpoint"
  subnet_ids         = [for subnet in aws_subnet.public : subnet.id]
  vpc_id             = aws_vpc.main.id
  security_group_ids = [aws_security_group.opensearch_security_group.id]
}

resource "aws_secretsmanager_secret" "opensearch_url_secret" {
  name                    = "/martletplace/opensearch_url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "opensearch_url_version" {
  secret_id     = aws_secretsmanager_secret.opensearch_url_secret.id
  secret_string = aws_opensearchserverless_collection.martletplace-collection.collection_endpoint
}
