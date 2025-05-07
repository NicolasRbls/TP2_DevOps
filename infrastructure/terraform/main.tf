# Configuration du provider Google Cloud
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "advertising-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "advertising-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Firewall rules
resource "google_compute_firewall" "allow_http" {
  name    = "allow-http"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
}

# Artifact Registry pour les images Docker
resource "google_artifact_registry_repository" "repository" {
  location      = var.region
  repository_id = "advertising-repo"
  format        = "DOCKER"
}

# Cluster GKE avec node pool par défaut
resource "google_container_cluster" "primary" {
  name     = "advertising-cluster"
  location = var.zone  # Zone unique
  
  # Utiliser le node pool par défaut
  initial_node_count = 1
  
  # Configuration du node pool par défaut
  node_config {
    machine_type = "e2-small"
    disk_size_gb = 10
    
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
  
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name
  deletion_protection = false
}

# Cloud SQL avec IP publique
resource "google_sql_database_instance" "instance" {
  name             = "advertising-db-instance"
  database_version = "POSTGRES_13"
  region           = var.region
  
  settings {
    tier = "db-f1-micro"  # Instance la plus petite
    
    # Configuration IP publique uniquement (pas de réseau privé)
    ip_configuration {
      ipv4_enabled = true
      # Ne pas inclure private_network
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"  # Autoriser toutes les adresses IP (pour dev uniquement)
      }
    }
  }
  
  # Désactiver la protection contre la suppression pour faciliter le nettoyage
  deletion_protection = false
}

resource "google_sql_database" "database" {
  name     = "advertising"
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_user" "users" {
  name     = "postgres"
  instance = google_sql_database_instance.instance.name
  password = "postgres"  # Dans un environnement de production, utilisez des secrets
}

# Cloud Monitoring
resource "google_monitoring_dashboard" "dashboard" {
  dashboard_json = <<EOF
{
  "displayName": "Advertising Campaign Dashboard",
  "gridLayout": {
    "widgets": [
      {
        "title": "CPU Usage",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"kubernetes.io/container/cpu/core_usage_time\" resource.type=\"k8s_container\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }
          ]
        }
      },
      {
        "title": "Memory Usage",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"kubernetes.io/container/memory/used_bytes\" resource.type=\"k8s_container\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
}
EOF
}