resource "tls_private_key" "jwt_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_secretsmanager_secret" "jwt_private_key_secret" {
  name                    = "/martletplace/jwt_private_key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_private_key_secret.id
  secret_string = tls_private_key.jwt_key.private_key_pem_pkcs8
}
