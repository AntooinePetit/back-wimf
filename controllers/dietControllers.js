const db = require("../db");

/**
 * Récupère les informations de tous les régimes de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant tous les régimes disponibles dans la base de données.
 * @example
 * // GET /api/v1/diets
 */
exports.getAllDiets = async (req, res) => {
  try {
    const diets = await db.manyOrNone("SELECT * FROM diets");

    return res.status(200).json(diets);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Permet de rechercher un ou plusieurs régimes dans la base de données par leur nom.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant les informations des régimes recherchés.
 * @example
 * // GET /api/v1/diets/search/végé
 */
exports.searchDiet = async (req, res) => {
  try {
    const { search } = req.params;

    const splitSearch = search
      .split("+")
      .map((word) => word.trim())
      .filter(Boolean);

    const conditions = splitSearch
      .map((_, idx) => `name_diet ILIKE $${idx + 1}`)
      .join(" OR ");

    const values = splitSearch.map((word) => `%${word}%`);

    const searchResult = await db.any(
      `SELECT * FROM diets
      WHERE ${conditions}`,
      values
    );

    return res.status(200).json(searchResult);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
