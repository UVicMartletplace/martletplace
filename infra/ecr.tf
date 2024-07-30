resource "aws_ecr_repository" "main" {
  for_each = toset(["user", "listing", "review", "message", "charity", "search", "recommend", "frontend", "collector", "pgsync"])

  name                 = "martletplace/${each.value}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }
}
