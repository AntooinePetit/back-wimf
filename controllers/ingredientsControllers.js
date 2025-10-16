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
      await db.many(`SELECT i.name_ingredient, c.name_ingredient_category 
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
      .join(" AND ");

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
