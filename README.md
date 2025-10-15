# WIMF Back

![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Statut CI](https://img.shields.io/badge/CI-Passing-brightgreen.svg)

Cette API REST fournit des points d'accès pour gérer les données de recettes et d'utilisateurs. Elle est construite avec JavaScript.

## Fonctionnalités

- Création, lecture, mise à jour et suppression d'utilisateurs.
- Création, lecture, mise à jour et suppression de recettes.
- Authentification par jeton JWT.
- Modification de mot de passe oublié par jeton JWT
- Validation des données d'entrée.

## Technologies utilisées

- Node.js
- Express.js
- Neon
- JWT
- Bcrypt

## Installation

### Prérequis

- Node.js (v14 ou supérieur)
- [Neon](https://neon.com/)

### Étapes

1. Cloner le dépôt :

```bash
git clone https://github.com/AntooinePetit/back-wimf
cd [nom_du_dossier]
```

2. Installer les dépendances :

```bash
npm install
```

3. Configurer les variables d'environnement (créez un fichier `.env` à la racine du projet) :

```
PORT=3000
POSTGRESQL_URI=MonLienDeConnectionNeon
JWT_SECRET=votre_secret_jwt_super_securise
```

4. Lancer l'API :

```bash
nodemon .\app.js
```

L'API sera disponible sur `http://localhost:3000`.

## Utilisation de l'API

Exemples d'utilisation de l'API. Pour plus d'informations, consultez la [documentation ici](./DOCS.md)

### Enregistrement d'un utilisateur

**POST** `/api/v1/auth/register`

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password1234"
}
```

Retourne un jeton JWT d'authentification.

### Connexion d'un utilisateur

**POST** `/api/v1/auth/login`

```json
{
  "email": "test@example.com",
  "password": "password1234"
}
```

Retourne un jeton JWT d'authentification.

### Obtention des informations de tous les utilisateurs inscrits

**GET** `/api/v1/users`

Header: `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte modérateur ou administrateur

### Obtention des informations d'un utilisateur spécifique

**GET** `/api/v1/users/:id_de_l_utilisateur`

Header: `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte modérateur ou administrateur OU du compte utilisateur recherché

### Récupérer toutes les recettes

**GET** `/api/v1/recipes/`

### Récupérer une recette spécifique

**GET** `/api/v1/recipes/:id`

  <!-- 
## Exécution des tests

```bash
npm test
```

<!-- 

## Contribution

Voir le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives de contribution.

## Licence

Ce projet est sous licence Apache 2.0. Voir le fichier _LICENSE_ pour plus de détails.

## Contact

Pour toute question, contactez [votre nom/email](mailto:votre.mail@example.com) -->
