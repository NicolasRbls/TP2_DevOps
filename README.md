# Application de Gestion de Campagnes Publicitaires

## Architecture

Cette application est déployée sur Google Cloud Platform avec une architecture microservices :

- **Frontend** : React.js avec authentification JWT
- **Backend** : Node.js/Express avec API RESTful
- **Base de données** : PostgreSQL sur Cloud SQL
- **Infrastructure** : Kubernetes Engine (GKE) avec autoscaling
- **CI/CD** : GitHub Actions pour l'intégration et le déploiement continus
- **Monitoring** : Cloud Monitoring avec tableaux de bord personnalisés et alertes

## Technologies utilisées

- **Conteneurisation** : Docker pour packaging et déploiement uniforme
- **Orchestration** : Kubernetes pour la gestion des conteneurs
- **Infrastructure as Code** : Terraform pour le provisionnement de l'infrastructure
- **Stockage d'images** : Artifact Registry pour héberger les images Docker
- **Base de données** : Cloud SQL PostgreSQL pour la persistance des données
- **Observabilité** : Cloud Monitoring pour la surveillance et les alertes

## Infrastructure

L'infrastructure est déployée avec Terraform et comprend :
- Réseau VPC dédié avec sous-réseau pour isoler les composants
- Cluster GKE pour l'orchestration des conteneurs
- Instance Cloud SQL pour la base de données PostgreSQL
- Dépôt Artifact Registry pour les images Docker
- Tableaux de bord de monitoring pour la surveillance

## Pipeline CI/CD

Le pipeline CI/CD est configuré avec GitHub Actions et comprend :
- Tests automatiques du code
- Construction des images Docker
- Publication sur Artifact Registry
- Déploiement sur GKE

## Monitoring

La solution de monitoring comprend :
- Tableaux de bord personnalisés pour surveiller les performances
- Métriques de CPU, mémoire et réseau
- Alertes automatiques en cas de problème
- Journalisation centralisée

## Guide de déploiement

1. Cloner le dépôt
2. Exécuter `terraform apply` dans le dossier infrastructure/terraform
3. Configurer la base de données avec le script SQL
4. Construire et pousser les images Docker vers Artifact Registry
5. Déployer l'application sur GKE

## Guide de maintenance

- Mise à jour de l'application : Pusher les modifications sur la branche main pour déclencher le pipeline CI/CD
- Scaling : Modifier le nombre de réplicas dans les fichiers de déploiement Kubernetes
- Sauvegardes : Des sauvegardes automatiques de la base de données sont configurées

## Auteur

TP DevOps & Cloud Computing
