# Nom de l'API REST

![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Statut CI](https://img.shields.io/badge/CI-Passing-brightgreen.svg)

Cette API REST fournit des points d'accès pour gérer les utilisateurs et leurs données. Elle est construite avec JavaScript.

## Fonctionnalités

- Création, lecture, mise à jour et suppression d'utilisateurs.
- Création, lecture, mise à jour et suppression de recettes.
- Authentification par jeton JWT.
- Modification de mot de passe oublié par jeton JWT
- Validation des données d'entrée.

## Technologies utilisées

- Node.js
- Express.js
- MongoDB
- JWT

## Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)

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
MONGO_URI=mongodb+srv://[username]:[password]@cluster0.r5wdwyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=votre_secret_jwt_super_securise
```

4. Lancer l'API :

```bash
node .\app.js
```

L'API sera disponible sur `http://localhost:3000`.

## Utilisation de l'API

<!-- ### Enregistrement d'un utilisateur

**POST** `/api/auth/register`

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password1234"
}
```

### Connexion d'un utilisateur

**POST** `/api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "password1234"
}
```

Retourne un jeton JWT.

### Obtenir tous les utilisateurs (nécessite un jeton d'authentification)

**GET** `/api/users`

Header: `Authorization: Bearer <votre_jeton_jwt>`

## Exécution des tests

```bash
npm test
```

## Contribution

Voir le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives de contribution.

## Licence

Ce projet est sous licence Apache 2.0. Voir le fichier _LICENSE_ pour plus de détails.

## Contact

Pour toute question, contactez [votre nom/email](mailto:votre.mail@example.com) -->
