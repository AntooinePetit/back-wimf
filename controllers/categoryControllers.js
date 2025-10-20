const db = require("../db");

/**
 * Récupère les informations de toutes les catégories et les recettes liées.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant toutes les catégories ainsi que les id des recettes qui y sont liés.
 * @example
 * // GET /api/v1/categories
 */
exports.getAllCategoriesAndRecipes = async (req, res) => {
  try {
    const categoriesAndRecipes = await db.manyOrNone(
      `SELECT c.name_recipe_category, r.id_recipe 
      FROM recipes_has_recipe_categories AS rc
      INNER JOIN recipe_categories AS c ON rc.fk_id_category = c.id_recipe_category
      INNER JOIN recipes AS r ON rc.fk_id_recipe = r.id_recipe
      ORDER BY c.name_recipe_category`
    );

    return res.status(200).json(categoriesAndRecipes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
