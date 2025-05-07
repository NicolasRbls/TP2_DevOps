variable "project_id" {
  description = "Le ID du projet Google Cloud"
  type        = string
  default     = "onyx-silo-459007-n1"  # Remplacez par votre ID de projet réel
}

variable "region" {
  description = "Région GCP pour toutes les ressources"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "Zone GCP pour les ressources zonales"
  type        = string
  default     = "europe-west1-b"
}