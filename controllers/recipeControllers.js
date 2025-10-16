const db = require("../db");

/**
 * Récupère toutes les recettes.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant toutes les recettes disponibles sur l'application.
 * @example
 * // GET /api/v1/recipes
 */
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await db.many("SELECT * FROM recipes");

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère une recette grâce à son ID
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de la recettes choisie.
 * @example
 * // GET /api/v1/recipes/1
 *
 * // Retourne les informations de la recette correspondant à l'id 1
 */
exports.getOneRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      id
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recette introuvable" });
    }

    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Crée une nouvelle recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant un message de confirmation de création ainsi que les informations de la recette.
 * @example
 * // POST /api/v1/recipes/
 * {
 *  "name": "Recette de test",
 *  "preparationTime": 20,
 *  "cookingTime": 12,
 *  "restingTime": 0,
 *  "instructions": {
 *    "steps": [
 *      "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
 *      "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
 *      "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
 *      "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir."
 *    ]
 *  },
 *  "nutritionalValues": {
 *    "totalFat": {
 *      "name": "Matières grasses totales",
 *      "quantity": 10,
 *      "unit": "g"
 *    },
 *    "saturatedFat": {
 *      "name": "Acides gras saturés",
 *      "quantity": 4,
 *      "unit": "g"
 *    },
 *    "cholesterol": {
 *      "name": "Cholestérol",
 *      "quantity": 53,
 *      "unit": "mg"
 *    },
 *    "sodium": {
 *      "name": "Sodium",
 *      "quantity": 85,
 *      "unit": "mg"
 *    },
 *    "totalCarbohydrate": {
 *      "name": "Glucides totaux",
 *      "quantity": 15,
 *      "unit": "g"
 *    },
 *    "dietaryFiber": {
 *      "name": "Fibres alimentaires",
 *      "quantity": 1,
 *      "unit": "g"
 *    },
 *    "totalSugars": {
 *      "name": "Sucres totaux",
 *      "quantity": 10,
 *      "unit": "g"
 *    },
 *    "protein": {
 *      "name": "Protéines",
 *      "quantity": 10,
 *      "unit": "g"
 *    },
 *    "calcium": {
 *      "name": "Calcium",
 *      "quantity": 19,
 *      "unit": "mg"
 *    },
 *    "iron": {
 *      "name": "Fer",
 *      "quantity": 1,
 *      "unit": "mg"
 *    },
 *    "potassium": {
 *      "name": "Potassium",
 *      "quantity": 183,
 *      "unit": "mg"
 *    },
 *    "calories": {
 *      "name": "Calories",
 *      "quantity": 193,
 *      "unit": "kcal"
 *    }
 *  },
 *  "servings": 10
 * }
 */
exports.addRecipe = async (req, res) => {
  try {
    const {
      name,
      preparationTime,
      cookingTime,
      restingTime,
      instructions,
      nutritionalValues,
      servings,
    } = req.body;

    const existingRecipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE name_recipe = $1",
      name
    );

    if (existingRecipe != null) {
      return res
        .status(409)
        .json({ message: "Ce nom de recette est déjà utilisé" });
    }

    const totalTime =
      parseInt(preparationTime) + parseInt(cookingTime) + parseInt(restingTime);

    const recipeCreated = await db.one(
      `INSERT INTO recipes(name_recipe, preparation_time, cooking_time, resting_time, instructions, total_time, nutritional_values_recipe, servings_recipe) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        name,
        preparationTime,
        cookingTime,
        restingTime,
        instructions,
        totalTime,
        nutritionalValues,
        servings,
      ]
    );

    res
      .status(201)
      .json({ message: "Recette ajoutée avec succès", recipeCreated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour les informations d'une recette donnée
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant un message de confirmation de mise à jour ainsi que les informations de la recette.
 * @example
 * // PUT /api/v1/recipes/1
 * {
 *  "name": "Recette de test renommée"
 * }
 */
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      id
    );

    if (!existingRecipe) {
      return res.status(404).json({ message: "Recette introuvable" });
    }

    const {
      name,
      preparationTime,
      cookingTime,
      restingTime,
      instructions,
      nutritionalValues,
      servings,
    } = req.body;

    const existingRecipeName = await db.oneOrNone(
      "SELECT * FROM recipes WHERE name_recipe = $1 AND id_recipe != $2",
      [name, id]
    );

    if (existingRecipeName) {
      return res
        .status(409)
        .json({ message: "Ce nom de recette n'est pas disponible" });
    }

    // TODO: Modifier pour mettre à jour le temps total avec le changement d'une seule des données
    const totalTime =
      preparationTime && cookingTime && restingTime
        ? parseInt(preparationTime) +
          parseInt(cookingTime) +
          parseInt(restingTime)
        : existingRecipe.totalTime;

    const recipeUpdated = await db.one(
      `UPDATE recipes
        SET
          name_recipe = $1,
          preparation_time = $2,
          cooking_time = $3,
          instructions = $4,
          total_time = $5,
          "nutritional_values_recipe" = $6,
          servings_recipe = $7
        WHERE id_recipe = $8
        RETURNING *`,
      [
        name ?? existingRecipe.name_recipe,
        preparationTime ?? existingRecipe.preparation_time,
        cookingTime ?? existingRecipe.cooking_time,
        instructions ?? existingRecipe.instructions,
        totalTime,
        nutritionalValues ?? existingRecipe.nutritional_values_recipe,
        servings ?? existingRecipe.servings_recipe,
        id,
      ]
    );

    res.status(200).json({ message: "Recette mise à jour", recipeUpdated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime une recette de la base de données
 * 
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant un message de confirmation de mise à jour ainsi que les informations de la recette.
 * @example
 * // /api/v1/recipes/1
 */
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecipe = await db.result(`DELETE FROM recipes WHERE id_recipe = $1`, id)

    if(deletedRecipe.rowCount === 0){
      return res.status(404).json({message: "Recette introuvable"})
    }

    res.status(204).json({message: "Recette supprimée"})
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
