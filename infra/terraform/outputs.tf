output "bucket_name" {
  description = "Nombre del bucket S3 para el workflow de GitHub Actions (variable S3_BUCKET)."
  value       = aws_s3_bucket.site.id
}

output "website_endpoint" {
  description = "URL HTTP del sitio (S3 static website)."
  value       = "http://${aws_s3_bucket_website_configuration.site.website_endpoint}"
}

output "github_actions_role_arn" {
  description = "ARN del rol IAM para el secret AWS_ROLE_ARN en GitHub."
  value       = aws_iam_role.github_actions.arn
}

output "aws_region" {
  description = "Región usada (variable AWS_REGION en GitHub)."
  value       = var.aws_region
}
