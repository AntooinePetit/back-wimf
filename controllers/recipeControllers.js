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
