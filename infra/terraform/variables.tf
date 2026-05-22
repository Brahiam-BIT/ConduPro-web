variable "aws_region" {
  description = "Región AWS para el bucket S3 y recursos IAM."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefijo del nombre del bucket (debe ser DNS-compatible)."
  type        = string
  default     = "condupro-web"
}

variable "github_repository" {
  description = "Repositorio GitHub en formato org/repo (restringe OIDC)."
  type        = string
}

variable "github_branch" {
  description = "Rama que puede asumir el rol de despliegue."
  type        = string
  default     = "main"
}
