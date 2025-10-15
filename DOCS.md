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

### Récupérer toutes les recettes

**GET** `/api/v1/recipes/`

### Récupérer une recette spécifique

**GET** `/api/v1/recipes/:id`

### Ajouter une recette à la base de données

**POST** `/api/v1/recipes/`

Headers : `Authorization: Bearer <votre_jeton_jwt>`

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

Headers : `Authorization: Bearer <votre_jeton_jwt>`

```json
{
  "name": "Recette de test renommée"
}
```

Nécessite un token d'authentification d'un compte administrateur
