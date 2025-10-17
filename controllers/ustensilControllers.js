const db = require("../db");

/**
 * Récupère les informations de tous les ustensiles de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant tous les ustensils disponibles dans la base de données.
 * @example
 * // GET /api/v1/ustensils
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 */
exports.getAllUstensils = async (req, res) => {
  try {
    const ustensils = await db.manyOrNone("SELECT * FROM ustensils");

    return res.status(200).json(ustensils);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
