const db = require("../db");

/**
 * Permet de récupérer tous les ingrédients bannis par un utilisateur donné
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de tous les ingrédients bannis par un utilisateur donné.
 * @example
 * // GET /api/v1/categories/1
 */
exports.getBannedIngredientsFromUser = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    const { id } = req.params;

    // SI l'utilisateur connecté EST member ET id de l'utilisateur connecté DIFFERENT DE id de l'utilisateur à qui ajouter un régime
    // SI l'utilisateur connecté EST moderator ET id de l'utilisateur connecté DIFFERENT DE id de l'utilisateur à qui ajouter un régime
    // SI l'utilisateur n'est pas connecté
    if (
      !userConnected ||
      (userConnected.rights_user != "Administrator" && req.user.id != id)
    ) {
      return res.status(401).json({
        message: "Tu n'as pas le droit d'ajouter un régime à cet utilisateur",
      });
    }

    const bannedIngredients = await db.manyOrNone(
      `SELECT i.id_ingredient, i.name_ingredient, c.name_ingredient_category FROM banned_ingredients AS b
      INNER JOIN ingredients AS i ON b.fk_id_ingredient = i.id_ingredient
      INNER JOIN ingredient_categories AS c ON i.fk_id_ingredient_category = c.id_ingredient_category
      WHERE b.fk_id_user = $1`,
      id
    );

    return res.status(200).json(bannedIngredients);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
