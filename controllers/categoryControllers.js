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

/**
 * Lie une ou plusieurs catégories à une recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les liens créés.
 * @example
 * // POST /api/v1/categories/link/1+4+5+2
 * // Le premier id doit être l'id de la recette suivi des id des catégories à lui ajouter.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.linkCategoriesToRecipe = async (req, res) => {
  try {
    const { ids } = req.params;

    const splitIds = ids
      .split("+")
      .map((id) => id.trim())
      .filter(Boolean);

    const inputs = splitIds
      .slice(1)
      .map((_, idx) => `($1, $${idx + 2})`)
      .join(", ");

    const values = splitIds.map((id, idx) => parseInt(id));

    const addedCategories = await db.many(
      `INSERT INTO recipes_has_recipe_categories (fk_id_recipe, fk_id_category)
      VALUES ${inputs}
      RETURNING *`,
      values
    );

    return res.status(201).json(addedCategories);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Delie une catégorie d'une recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 pour valider la suppression.
 * @example
 * // DELETE /api/v1/categories/link/1+4
 * // Le premier id doit être l'id de la recette et le deuxième l'id de la catégorie à délier.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.unlinkCategoryFromRecipe = async (req, res) => {
  try {
    const { ids } = req.params;

    const splitIds = ids
      .split("+")
      .map((id) => parseInt(id.trim()))
      .filter(Boolean);

    const deletedDiet = await db.result(
      `DELETE FROM recipes_has_recipe_categories
      WHERE fk_id_recipe = $1
      AND fk_id_category = $2`,
      splitIds
    );

    if (deletedDiet.rowCount === 0) {
      return res.status(404).json({
        message:
          "Aucun lien entre cette catégorie et cette recette n'a été trouvé",
      });
    }

    return res.status(204).json({ message: "Lien supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Permet de récupérer tous les id des recettes correspondant à la catégorie choisie
 * 
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les id de toutes les recettes correspondant à la catégorie.
 * @example
 * // GET /api/v1/categories/1
 */
exports.getAllRecipesFromCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const recipes = await db.manyOrNone(
      `SELECT c.name_recipe_category, r.id_recipe 
      FROM recipes_has_recipe_categories AS rc
      INNER JOIN recipe_categories AS c ON rc.fk_id_category = c.id_recipe_category
      INNER JOIN recipes AS r ON rc.fk_id_recipe = r.id_recipe
      WHERE rc.fk_id_category = $1`,
      id
    );

    return res.status(200).json(recipes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
