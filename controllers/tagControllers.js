const db = require("../db");

/**
 * Récupère tous les tags disponibles dans la base de données
 * 
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de tous les tags de la base de données.
 * @example
 * // GET /api/v1/tags
 */
exports.getAllTags = async (req, res) => {
  try {
    const tags = await db.manyOrNone("SELECT * FROM tags");

    return res.status(200).json(tags);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
