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
