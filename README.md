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
- **Orchestration IA :** Vercel AI SDK + OpenRouter (sorties structurées validées par Zod)
- **Persistance des Données :** PostgreSQL (avec conformité stricte aux régulations de protection des données de santé)
- **IA / Vision & Clinique :** Modèle multimodal vision-langage `z-ai/glm-4.5v` (configurable via `AI_MODEL`) avec moteur heuristique déterministe intégré (mode démo sans clé API)

## 🚀 Quick Start (Installation en local)

Pour lancer le projet en local sur votre machine, suivez les étapes ci-dessous :

### Prérequis
- Node.js v20.9+ (v24 utilisée en développement et en production)
- Un gestionnaire de paquets (npm, pnpm ou yarn)
- Une base de données PostgreSQL (optionnelle — persistance best-effort)

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
```env
# Chaîne de connexion PostgreSQL (persistance best-effort : l'app fonctionne sans DB)
DATABASE_URL=postgresql://user:password@localhost:5432/onguard_db

# Clé OpenRouter (https://openrouter.ai/keys) — OPTIONNELLE.
# Sans clé, OnGuard AI fonctionne en mode démo (moteur heuristique déterministe).
OPENROUTER_API_KEY=votre_cle_openrouter

# Modèle vision OpenRouter (défaut : z-ai/glm-4.5v)
AI_MODEL=z-ai/glm-4.5v
```
### 4. Initialiser la base de données (optionnel)
La persistance est **best-effort** : l'application reste pleinement fonctionnelle sans base de données.
```bash
# Créer la base (PostgreSQL local)
createdb onguard_db

# Pousser le schéma Prisma et générer le client
npx prisma db push
```
### 5. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🚢 Mise en production (Vercel)

Le projet est déjà déployé et opérationnel : **https://onguard-ai.vercel.app**

### État actuel
- **Projet Vercel :** `onguard-ai` (team *amidala-samaris-projects*), preset **Next.js**, Node.js 24.x
- **Intégration GitHub :** dépôt `codertobi77/OnGuard-AI` connecté — **chaque push sur `main` déclenche un déploiement production automatique**
- **Protection SSO :** désactivée sur ce projet (l'URL est publique) ; protection des forks Git active
- **Variable d'environnement :** `AI_MODEL=z-ai/glm-4.5v` (Production)

### Activer le moteur IA en production (optionnel)
Sans `OPENROUTER_API_KEY`, la production tourne en **mode démo** (moteur heuristique déterministe, badge visible dans l'UI).
```bash
# Ajouter la clé en production (la valeur est lue depuis stdin, jamais affichée)
printf 'votre_cle_openrouter' | vercel env add OPENROUTER_API_KEY production

# Redéployer pour appliquer
vercel deploy --prod
```

### Activer la persistance en production (optionnel)
Le `DATABASE_URL` local (`localhost:5432`) n'est pas joignable depuis Vercel. Pour activer la persistance (dashboard + historique des évaluations), provisionnez une base PostgreSQL hébergée ([Supabase](https://supabase.com), [Neon](https://neon.tech)…) puis :
```bash
printf 'postgresql://user:password@host:5432/onguard_db' | vercel env add DATABASE_URL production
vercel deploy --prod
```
Le schéma se pousse avec : `DATABASE_URL="<url_prod>" npx prisma db push` (à exécuter une seule fois).

> ⚠️ **Ne commitez jamais ces valeurs** : `.env.local` est ignoré par Git (pattern `.env*`).

### Déployer depuis zéro (nouvel environnement)
```bash
npm i -g vercel          # CLI Vercel
vercel login             # authentification
vercel link              # lier/créer le projet (Vercel détecte Next.js)
vercel git connect https://github.com/<compte>/OnGuard-AI   # auto-déploiement sur push
vercel deploy --prod     # premier déploiement production
```

**Points de vigilance :**
- Le nom du projet Vercel doit être en **minuscules** (ex. `onguard-ai`) ;
- Si le projet est créé via `vercel project add`, vérifiez que le **Framework Preset est bien « Next.js »** (un preset « Other » provoque un 404 global) : `vercel project inspect onguard-ai` ;
- Sur une team avec SSO activé, désactivez la protection pour un accès public : `vercel project protection disable onguard-ai --sso`.

### Vérifications post-déploiement
```bash
# Pages publiques
curl -s -o /dev/null -w '%{http_code}' https://onguard-ai.vercel.app/          # 200 attendu
curl -s -o /dev/null -w '%{http_code}' https://onguard-ai.vercel.app/assess     # 200 attendu
curl -s -o /dev/null -w '%{http_code}' https://onguard-ai.vercel.app/dashboard  # 200 attendu

# Analyse (renvoie le JSON structuré : riskScore, riskLevel, abcdeAssessment…)
curl -s -X POST https://onguard-ai.vercel.app/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"clinicalData":{"lesionLocation":"back","duration":"1-6-months","symptoms":[],"familyHistory":false},"imageBase64":"<image_base64>","lang":"en"}'

# Rapport PDF (la sortie doit commencer par %PDF)
curl -s -X POST https://onguard-ai.vercel.app/api/report \
  -H 'Content-Type: application/json' \
  -d '{"result":{...},"clinicalData":{...},"lang":"fr","format":"pdf"}' | head -c 8
```

### Domaine personnalisé (optionnel)
```bash
vercel domains add votre-domaine.com
vercel alias set onguard-ai.vercel.app votre-domaine.com
```

## 🔒 Éthique, Confidentialité & Conformité
OnGuard AI a été conçu avec un engagement strict envers la protection des données de santé :

- **Anonymisation et Sécurité :** Traitement sécurisé et chiffrement des données de santé au repos et en transit.
- **Conformité Réglementaire :** Architecture de persistance sous PostgreSQL conçue pour s'aligner sur les standards de protection des données (type RGPD / HIPAA).
- **Aide à la Décision :** OnGuard AI est un outil d'aide au pré-diagnostic destiné à assister les professionnels de santé, et ne remplace en aucun cas un avis médical officiel.
