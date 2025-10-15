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

exports.getOneRecipe = async (req, res) => {
  try {
    const id = req.params.id;

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
