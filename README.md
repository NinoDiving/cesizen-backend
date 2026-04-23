# CesiZen Backend

Backend de l'application CesiZen, développé avec NestJS, Prisma et PostgreSQL.

## 🚀 Stack Technique

*   **Framework** : [NestJS](https://nestjs.com/) (Node.js)
*   **Base de données** : [PostgreSQL](https://www.postgresql.org/)
*   **ORM** : [Prisma](https://www.prisma.io/)
*   **Authentification** : JWT (JSON Web Token) avec Passport.js
*   **Validation** : Class-validator & Class-transformer
*   **Documentation API** : Swagger / OpenAPI
*   **Conteneurisation** : Docker

## 🛠️ Installation et Lancement

### Pré-requis
*   Node.js (v20+)
*   pnpm
*   Docker

### 1. Configuration de l'environnement
Copiez le fichier `.env.local` en `.env` et ajustez les variables si nécessaire :
```bash
cp .env.local .env.test .env
```

### 2. Lancement du projet
Lancez l'ensemble de l'infrastructure (Base de données + Backend) :
```bash
docker-compose up --build
```

### 3. Initialisation de la base de données (au premier lancement)
Une fois les conteneurs lancés, appliquez le schéma Prisma à votre base de données :
```bash
pnpm run prisma:push
```
L'API sera disponible sur `http://localhost:3001` (selon votre config). La documentation Swagger est accessible sur `http://localhost:3001/api`.

## 🧪 Documentation des Tests

Le projet utilise une suite de tests complète organisée par module pour garantir la fiabilité du code et de l'API.

### 📂 Structure des Tests
Tous les tests par module sont regroupés dans un dossier unique pour plus de clarté :

```text
src/modules/[module]/test/
├── [module].service.spec.ts    # Logique métier et Persistance (Intégration DB)
├── [module].controller.spec.ts # Routes API et Sécurité (Intégration HTTP)
└── [guard/pipe].spec.ts        # Unités isolées (Tests Unitaires Mocks)
test/
└── [feature].e2e-spec.ts       # Flux complets (Bout en bout)
```

#### 📋 Détails des Tests par Module

| Module | Fichier | Type | Cas de test | Sortie attendue |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `auth.service.spec.ts` | Intégration | Inscription / Connexion | JWT + Persistance BDD |
| | `jwt-auth.guard.spec.ts` | Unitaire | Validation Token / Suspension | `true` ou `401 Unauthorized` |
| | `roles.guard.spec.ts` | Unitaire | Vérification RBAC | `true` ou `403 Forbidden` |
| **Users** | `users.service.spec.ts` | Intégration | Création Admin / Suspension | État BDD mis à jour |
| **Activities**| `activities.service.spec.ts`| Intégration | CRUD + Favoris | Persistance correcte |
| **Admin** | `admin.controller.spec.ts` | Intégration | Gestion des ressources | Délégation aux services |
| **Ressources**| `ressources.service.spec.ts`| Intégration | CRUD Ressources | Données persistées |
| **Themes** | `themes.service.spec.ts` | Intégration | Listing et visibilité | Thèmes filtrés et ordonnés |

#### 🚀 Exécution des Tests

```bash
# Lancer les tests par module (Service + Controller)
pnpm run test

# Lancer les tests E2E
pnpm run test:e2e
```

## 🔒 Sécurité
*   **JWT** : Toutes les routes sensibles sont protégées par un `JwtAuthGuard`.
*   **RBAC** : Les routes d'administration sont protégées par un `RolesGuard` (`@Roles(Role.ADMIN)`).
*   **Suspension** : Un utilisateur suspendu est immédiatement déconnecté et ne peut plus utiliser son token, grâce à une vérification en temps réel dans le Guard.
