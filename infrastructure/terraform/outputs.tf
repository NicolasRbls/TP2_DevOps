output "kubernetes_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "Nom du cluster GKE"
}

output "kubernetes_cluster_host" {
  value       = "https://${google_container_cluster.primary.endpoint}"
  description = "Endpoint du cluster GKE"
  sensitive   = true
}

output "db_instance_connection_name" {
  value       = google_sql_database_instance.instance.connection_name
  description = "Nom de connexion de l'instance Cloud SQL"
}

output "db_instance_ip" {
  value       = google_sql_database_instance.instance.ip_address.0.ip_address
  description = "Adresse IP de l'instance Cloud SQL"
}

output "artifact_registry_repository" {
  value       = google_artifact_registry_repository.repository.name
  description = "Nom du dépôt Artifact Registry"
}