const db = require("../db");

/**
 * Récupère tous les ingrédients.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les ingrédients disponibles sur l'application.
 * @example
 * // GET /api/v1/ingredients
 */
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients =
      await db.any(`SELECT i.name_ingredient, c.name_ingredient_category 
      FROM ingredients AS i 
      LEFT JOIN ingredient_categories AS c 
      ON i.fk_id_ingredient_category = c.id_ingredient_category`);

    res.status(200).json(ingredients);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère les ingrédients correspondant à la recherche envoyée.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les ingrédients correspondants à la recherche sur l'application.
 * @example
 * // GET /api/v1/ingredients/search/moutarde+dijon
 */
exports.searchIngredients = async (req, res) => {
  try {
    const { search } = req.params;

    // Coupe à chaque "+" dans les paramètres, puis assure qu'il n'y a aucun espace autour de chaque mot, et ne compte pas les mots "vides" (par exemple si la recherche est "moutarde++dijon", supprime le contenu entre les deux '+')
    const splitSearch = search
      .split("+")
      .map((word) => word.trim())
      .filter(Boolean);

    const conditions = splitSearch
      .map((_, idx) => `i.name_ingredient ILIKE $${idx + 1}`)
      .join(" OR ");

    const values = splitSearch.map((word) => `%${word}%`);

    const searchResult = await db.any(
      `SELECT i.name_ingredient, c.name_ingredient_category 
      FROM ingredients AS i 
      LEFT JOIN ingredient_categories AS c 
      ON i.fk_id_ingredient_category = c.id_ingredient_category
      WHERE ${conditions}`,
      values
    );

    res.status(200).json(searchResult);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère les ingrédients appartenant à une recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les ingrédients appartenant à la recette donnée.
 * @example
 * // GET /api/v1/ingredients/1
 */
exports.getIngredientsFromRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      id
    );

    if (!existingRecipe) {
      return res.status(404).json({ message: "Recette introuvable" });
    }

    const ingredients = await db.manyOrNone(
      `SELECT i.name_ingredient, ri.quantity, ri.mesurements FROM recipes_has_ingredients AS ri
      INNER JOIN ingredients AS i ON i.id_ingredient = ri.fk_id_ingredient
      WHERE fk_id_recipe = $1`,
      id
    );

    return res.status(200).json(ingredients);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Permet d'ajouter un ingrédient à la base de donnée.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de l'ingrédient ajouté.
 * @example
 * // POST /api/v1/ingredients/
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 * {
 *   "name": "Ingrédient test",
 *   "category": 21
 * }
 */
exports.addIngredient = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Le nom et la catégorie doivent être renseignés" });
    }

    const existingIngredient = await db.oneOrNone(
      "SELECT * FROM ingredients WHERE name_ingredient ILIKE $1",
      name
    );

    if (existingIngredient) {
      return res.status(409).json({ message: "Cet ingrédient existe déjà" });
    }

    const addedIngredient = await db.one(
      `INSERT INTO 
      ingredients(name_ingredient, fk_id_ingredient_category)
      VALUES ($1, $2)
      RETURNING *`,
      [name, category]
    );

    return res
      .status(201)
      .json({ message: "Ingrédient ajouté", addedIngredient });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Permet de mettre à jour un ingrédient de la base de donnée.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de l'ingrédient mis à jour.
 * @example
 * // PUT /api/v1/ingredients/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 * {
 *   "name": "Ingrédient test renommé",
 *   "category": 14
 * }
 */
exports.updateIngredient = async (req, res) => {
  try {
    const { name, category } = req.body;
    const { id } = req.params;

    const ingredientToUpdate = await db.oneOrNone(
      "SELECT * FROM ingredients WHERE id_ingredient = $1",
      id
    );

    if (!ingredientToUpdate) {
      return res.status(404).json({ message: "Ingrédient introuvable" });
    }

    const existingIngredient = await db.oneOrNone(
      "SELECT * FROM ingredients WHERE name_ingredient ILIKE $1 AND id_ingredient != $2",
      [name, id]
    );

    if (existingIngredient) {
      return res.status(409).json({
        message:
          "Ce nom d'ingrédient est déjà enregistré dans la base de donnée",
      });
    }

    const updatedIngredient = await db.one(
      `UPDATE ingredients
      SET 
      name_ingredient = $1,
      fk_id_ingredient_category = $2
      WHERE id_ingredient = $3
      RETURNING *`,
      [name, category, id]
    );

    return res
      .status(200)
      .json({ message: "Ingrédient mis à jour", updatedIngredient });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un ingrédient de la base de données
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 confirmant la délétion.
 * @example
 * // DELETE /api/v1/ingredients/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 */
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredientDeleted = await db.result(
      "DELETE FROM ingredients WHERE id_ingredient = $1",
      id
    );

    if (ingredientDeleted.rowCount === 0) {
      return res.status(404).json({ message: "Ingrédient introuvable" });
    }

    return res.status(204).json({ message: "Ingrédient supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
