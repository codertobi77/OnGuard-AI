# 🩺 OnGuard AI

> **OnGuard AI** est une solution d'assistance clinique intelligente développée dans le cadre du **2026 Intl CodeTheCure Hackathon** (Catégorie : *Detection & Diagnosis*).

## 🎯 Aperçu du Projet
OnGuard AI combine l'analyse d'images médicales (en dermatologie) et le raisonnement clinique par LLM pour aider les professionnels de santé et les patients dans la détection précoce des anomalies cutanées et l'évaluation structurée des risques.

## 🔄 Parcours Guidé Utilisateur
1. **Profil clinique & Questionnaire rapide :** Saisie des informations contextuelles (durée, évolution, symptômes).
2. **Importation de l'image dermoscopique :** Téléchargement sécurisé de la photo de la lésion.
3. **Analyse multi-modale en temps réel :** Croisement de l'analyse visuelle et des données cliniques.
4. **Rapport structuré & Recommandations :** Affichage d'un score de stratification des risques et de conseils de consultation prioritaire.

## 🛠️ Stack Technique
- **Frontend :** Next.js / React, Tailwind CSS
- **Backend :** Node.js (intégré via l'architecture API de Next.js)
- **Orchestration Agentique :** Vercel AI / eve
- **Persistance des Données :** PostgreSQL (avec conformité stricte aux régulations de protection des données de santé)
- **IA / Vision & Clinique :** Modèles multimodaux de vision-langage (ex: MedGemma / GLM-4.5V)

## 🚀 Quick Start (Installation en local)

Pour lancer le projet en local sur votre machine, suivez les étapes ci-dessous :

### Prérequis
- Node.js (v18+) installé
- Un gestionnaire de paquets (npm, pnpm ou yarn)
- Une base de données PostgreSQL configurée

### 1. Cloner le dépôt
```bash
git clone [https://github.com/votre-compte/OnGuard-AI.git](https://github.com/votre-compte/OnGuard-AI.git)
cd OnGuard-AI
```
### 2. Installer les dépendances
```bash
npm i
```
### 3. Configurer les variables d'environnement
Créez un fichier .env.local à la racine du projet en vous basant sur le fichier .env.example :
```md
DATABASE_URL=postgresql://user:password@localhost:5432/onguard_db
AI_MODEL_API_KEY=votre_cle_api_modele
```
### 4. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔒 Éthique, Confidentialité & Conformité
OnGuard AI a été conçu avec un engagement strict envers la protection des données de santé :

- **Anonymisation et Sécurité :** Traitement sécurisé et chiffrement des données de santé au repos et en transit.
- **Conformité Réglementaire :** Architecture de persistance sous PostgreSQL conçue pour s'aligner sur les standards de protection des données (type RGPD / HIPAA).
- **Aide à la Décision :** OnGuard AI est un outil d'aide au pré-diagnostic destiné à assister les professionnels de santé, et ne remplace en aucun cas un avis médical officiel.
