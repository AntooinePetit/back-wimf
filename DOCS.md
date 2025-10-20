# Utilisation de l'API

## Compte utilisateur

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

### Mot de passe oublié d'un utilisateur

**POST** `/api/v1/auth/forgot-pass`

```json
{
  "email": "test@example.com"
}
```

Retourne un jeton JWT de réinitialisation de mot de passe.

### Réinitialisation du mot de passe oublié

**PUT** `/api/v1/auth/reset-pass`

```json
{
  "email": "test@example.com",
  "password": "newpassword1234"
}
```

## Utilisateurs

### Obtention des informations de tous les utilisateurs inscrits

**GET** `/api/v1/users`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte modérateur ou administrateur

### Obtention des informations d'un utilisateur spécifique

**GET** `/api/v1/users/:id_de_l_utilisateur`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte modérateur ou administrateur OU du compte utilisateur recherché

### Mise à jour des informations d'un compte spécifique

**PUT** `/api/v1/users/:id_de_l_utilisateur`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

```json
{
  "username": "usertest",
  "rights": "Administrator",
  "nutritionalValues": false,
  "calories": false
}
```

Nécessite un token d'authentification d'un compte modérateur ou administrateur OU du compte utilisateur à modifier

### Suppresion d'un compte spécifique

**DELETE** `/api/v1/users/:id_de_l_utilisateur`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte modérateur ou administrateur OU du compte utilisateur à supprimer

## Recettes

### Obtention des informations de toutes les recettes

**GET** `/api/v1/recipes/`

### Obtention des informations d'une recette spécifique

**GET** `/api/v1/recipes/:id`

### Rechercher des recettes par leur nom

**GET** `/api/v1/recipes/search/:search`

Les mots doivent être séparés à l'aide d'un `+` dans la recherche.

### Ajouter une recette à la base de données

**POST** `/api/v1/recipes/`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Recette de test",
  "preparationTime": 20,
  "cookingTime": 12,
  "restingTime": 0,
  "instructions": {
    "steps": [
      "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
      "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
      "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
      "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir."
    ]
  },
  "nutritionalValues": {
    "totalFat": {
      "name": "Matières grasses totales",
      "quantity": 10,
      "unit": "g"
    },
    "saturatedFat": {
      "name": "Acides gras saturés",
      "quantity": 4,
      "unit": "g"
    },
    "cholesterol": {
      "name": "Cholestérol",
      "quantity": 53,
      "unit": "mg"
    },
    "sodium": {
      "name": "Sodium",
      "quantity": 85,
      "unit": "mg"
    },
    "totalCarbohydrate": {
      "name": "Glucides totaux",
      "quantity": 15,
      "unit": "g"
    },
    "dietaryFiber": {
      "name": "Fibres alimentaires",
      "quantity": 1,
      "unit": "g"
    },
    "totalSugars": {
      "name": "Sucres totaux",
      "quantity": 10,
      "unit": "g"
    },
    "protein": {
      "name": "Protéines",
      "quantity": 10,
      "unit": "g"
    },
    "calcium": {
      "name": "Calcium",
      "quantity": 19,
      "unit": "mg"
    },
    "iron": {
      "name": "Fer",
      "quantity": 1,
      "unit": "mg"
    },
    "potassium": {
      "name": "Potassium",
      "quantity": 183,
      "unit": "mg"
    },
    "calories": {
      "name": "Calories",
      "quantity": 193,
      "unit": "kcal"
    }
  },
  "servings": 10
}
```

Nécessite un token d'authentification d'un compte administrateur

### Mettre à jour les informations d'une recette

**PUT** `/api/v1/recipes/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Recette de test renommée"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Supprimer une recette

**DELETE** `/api/v1/recipes/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur

## Ingrédients

### Récupérer les informations de tous les ingrédients

**GET** `/api/v1/ingredients`

### Rechercher des ingrédients par leur nom

**GET** `/api/v1/ingredients/search/:search`

Les mots doivent être séparés à l'aide d'un `+` dans la recherche.

### Ajouter un ingrédient à la base de donnée

**POST** `/api/v1/ingredients`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Ingrédient test",
  "category": 21
}
```

Nécessite un token d'authentification d'un compte administrateur

### Mettre à jour un ingrédient de la base de données

**PUT** `/api/v1/ingredients/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Ingrédient test renommé",
  "category": 14
}
```

Nécessite un token d'authentification d'un compte administrateur

### Supprimer un ingrédient de la base de données

**DELETE** `/api/v1/ingredients/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur

## Tags

### Obtenir les informations de tous les tags

**GET** `/api/v1/tags`

### Rechercher des tags par leur nom

**GET** `/api/v1/tags/search/:search`

### Récupérer les tags liés à une recette

**GET** `/api/v1/tags/recipe/:id`

### Ajouter un tag

**POST** `/api/v1/tags/`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Tag Test"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Mettre à jour un tag

**PUT** `/api/v1/tag/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Tag Test renommé"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Supprimer un tag

**DELETE** `/api/v1/tag/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur

### Lier un ou plusieurs tags à une recette

**POST** `/api/v1/tags/link/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id de la recette à laquelle lier le ou les tags, suivi du ou des id de tag à ajouter. Chaque id doit être séparé du suivant par un `+`.

### Délier un tag d'une recette

**DELETE** `/api/v1/tags/link/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id de la recette à laquelle délier le tag, suivi de l'id du tag à délier. Les deux id doivent être séparé par un `+`.

## Ustensiles

### Obtenir les informations de tous les ustensiles

**GET** `/api/v1/ustensils`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur

### Rechercher un ou plusieurs ustensiles par leur nom

**GET** `/api/v1/ustensils/search/:search`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
Les mots doivent être séparés à l'aide d'un `+` dans la recherche.

### Récupérer les ustensiles liés à une recette

**GET** `/api/v1/ustensils/recipe/:id`

### Ajouter un ustensile à la base de données

**POST** `/api/v1/ustensils`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Ustensile test"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Mettre à jour un ustensile de la base de données

**PUT** `/api/v1/ustensils/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Ustensile test mis à jour"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Supprimer un ustensile de la base de données

**DELETE** `/api/v1/ustensils/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur

### Lier un ou des ustensiles à une recette

**POST** `/api/v1/ustensils/link/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id de la recette à laquelle lier le ou les ustensiles, suivi du ou des id d'ustensile à ajouter. Chaque id doit être séparé du suivant par un `+`.

### Délier un ustensile d'une recette

**DELETE** `/api/v1/ustensils/link/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id de la recette à laquelle délier l'ustensile, suivi de l'id de l'ustensile à délier. Les deux id doivent être séparé par un `+`.

## Régimes

### Obtenir les informations de tous les régimes

**GET** `/api/v1/diets`

### Rechercher un ou plusieurs régimes par leur nom

**GET** `/api/v1/diet/search/:search`

Les mots doivent être séparés à l'aide d'un `+` dans la recherche.

### Lier un ou des régimes à un tag

**POST** `/api/v1/diets/link/tag/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id du tag auquel lier le ou les régimes, suivi du ou des id de régime à ajouter. Chaque id doit être séparé du suivant par un `+`.

### Délier un régime d'un tag

**DELETE** `/api/v1/diets/link/tag/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id du tag à laquelle délier le régime, suivi de l'id du régime à délier. Les deux id doivent être séparé par un `+`.

### Ajouter un régime à la base de données

**POST** `/api/v1/diets`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Régime test"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Mettre à jour un régime de la base de données

**PUT** `/api/v1/diets/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

```json
{
  "name": "Régime test mis à jour"
}
```

Nécessite un token d'authentification d'un compte administrateur

### Supprimer un régime de la base de données

**DELETE** `/api/v1/diets/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur

### Lier un ou plusieurs régimes à un utilisateur

**POST** `/api/v1/diets/link/user/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte administrateur ou de l'utilisateur à qui lier le ou les régimes
La première valeur de `:ids` doit être l'id de l'utilisateur auquel lier le ou les régimes, suivi du ou des id de régime à ajouter. Chaque id doit être séparé du suivant par un `+`.

### Délier un régime d'un utilisateur

**DELETE** `/api/v1/diets/link/user/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte administrateur ou de l'utilisateur à qui délier le ou les régimes
La première valeur de `:ids` doit être l'id de l'utilisateur auquel délier le régime, suivi de l'id du régime à supprimer. Les deux id doivent être séparé par un `+`.

## Catégories de recettes (Entrée, Brunch, etc...)

### Récupérer toutes les catégories et leurs recettes liées

**GET** `/api/v1/categories`

### Lier une ou plusieurs catégories à une recette

**POST** `/api/v1/categories/link/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id de la recette à laquelle lier la ou les catégories, suivi du ou des id de catégorie à ajouter. Chaque id doit être séparé du suivant par un `+`.

### Délier une catégorie d'une recette

**DELETE** `/api/v1/categories/link/:ids`

Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`

Nécessite un token d'authentification d'un compte administrateur
La première valeur de `:ids` doit être l'id de la recette à laquelle délier la catégorie, suivi de l'id de la catégorie à délier. Les deux id doivent être séparé par un `+`.

### Obtenir les informations de toutes les recettes d'une catégorie choisie

**GET** `/api/v1/categories/:id`

## Ingrédients bannis par un utilisateur

### Récupérer les informations de tous les ingrédients bannis d'un utilisateur choisi

**GET** `/api/v1/banned/:id`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

Nécessite un token d'authentification d'un compte administrateur ou de l'utilisateur à consulter

### Ajouter un ingrédient à la liste des bannissements d'un utilisateur

**POST** `/api/v1/banned/:ids`

Nécessite un token d'authentification d'un compte administrateur ou de l'utilisateur à qui ajouter les ingrédients
La première valeur de `:ids` doit être l'id de l'utilisateur auquel ajouter les ingrédients à la liste des bannissements, suivi du ou des id d'ingrédient à ajouter. Chaque id doit être séparé du suivant par un `+`.

### Retirer un ingrédient de la liste des bannissements d'un utilisateur

**DELETE** `/api/v1/banned/:ids`

Nécessite un token d'authentification d'un compte administrateur ou de l'utilisateur à qui ajouter les ingrédients
La première valeur de `:ids` doit être l'id de l'utilisateur auquel retirer l'ingrédient de la liste des bannissements, suivi de l'id de l'ingrédient à supprimer. Les deux id doivent être séparé par un `+`.
