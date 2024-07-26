resource "aws_opensearchserverless_collection" "martletplace-collection" {
  name = "martletplace-collection"
  type = "SEARCH"

  depends_on = [
    aws_opensearchserverless_security_policy.opensearch-encryption-policy,
    aws_opensearchserverless_security_policy.opensearch-network-policy
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

resource "aws_opensearchserverless_vpc_endpoint" "martetplace-opensearch-endpoint" {
  name       = "martetplace-opensearch-endpoint"
  subnet_ids = [for subnet in aws_subnet.public : subnet.id]
  vpc_id     = aws_vpc.main.id
}

resource "aws_secretsmanager_secret" "opensearch_url_secret" {
  name                    = "/martletplace/opensearch_url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "opensearch_url_version" {
  secret_id     = aws_secretsmanager_secret.opensearch_url_secret.id
  secret_string = aws_opensearchserverless_collection.martletplace-collection.collection_endpoint
}
