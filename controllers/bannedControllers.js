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

/**
 * Ajoute un ou plusieurs ingrédients à la liste des bannissement d'un utilisateur.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les liens créés.
 * @example
 * // POST /api/v1/banned/1+4+5+2
 * // Le premier id doit être l'id de l'utilisateur suivi des id des ingrédients à ajouter à la liste des bannissements.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 */
exports.addBannedIngredientToUser = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    const { ids } = req.params;

    const splitIds = ids
      .split("+")
      .map((id) => id.trim())
      .filter(Boolean);

    // SI l'utilisateur connecté EST member ET id de l'utilisateur connecté DIFFERENT DE id de l'utilisateur à qui ajouter un régime
    // SI l'utilisateur connecté EST moderator ET id de l'utilisateur connecté DIFFERENT DE id de l'utilisateur à qui ajouter un régime
    // SI l'utilisateur n'est pas connecté
    if (
      !userConnected ||
      (userConnected.rights_user != "Administrator" &&
        req.user.id != splitIds[0])
    ) {
      return res.status(401).json({
        message:
          "Tu n'as pas le droit d'ajouter cet ingrédient à la liste de bannissement de cet utilisateur",
      });
    }

    const inputs = splitIds
      .slice(1)
      .map((_, idx) => `($1, $${idx + 2})`)
      .join(", ");

    const values = splitIds.map((id, idx) => parseInt(id));

    const addedBannedIngredients = await db.manyOrNone(
      `INSERT INTO banned_ingredients (fk_id_user, fk_id_ingredient)
      VALUES ${inputs}
      RETURNING *`,
      values
    );
    return res.status(201).json(addedBannedIngredients);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Délie un régime à un utilisateur.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 pour confirmer la suppression du lien.
 * @example
 * // DELETE /api/v1/banned/1+4+5+2
 * // Le premier id doit être l'id de l'utilisateur suivi de l'id de l'ingrédient à retirer de sa liste de bannissements.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 */
exports.deleteBannedIngredientFromUser = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    const { ids } = req.params;

    const splitIds = ids
      .split("+")
      .map((id) => id.trim())
      .filter(Boolean);

    // SI l'utilisateur connecté EST member ET id de l'utilisateur connecté DIFFERENT DE id de l'utilisateur à qui ajouter un régime
    // SI l'utilisateur connecté EST moderator ET id de l'utilisateur connecté DIFFERENT DE id de l'utilisateur à qui ajouter un régime
    // SI l'utilisateur n'est pas connecté
    if (
      !userConnected ||
      (userConnected.rights_user != "Administrator" &&
        req.user.id != splitIds[0])
    ) {
      return res.status(401).json({
        message:
          "Tu n'as pas le droit de modifier la liste des bannissements de cet utilisateur",
      });
    }

    const deletedBannedIngredient = await db.result(
      `DELETE FROM banned_ingredients
      WHERE fk_id_user = $1
      AND fk_id_ingredient = $2`,
      splitIds
    );

    if (deletedBannedIngredient.rowCount === 0) {
      return res.status(404).json({
        message:
          "Cet ingrédient n'est pas sur la liste des bannissements de cet utilisateur",
      });
    }

    return res.status(204).json({ message: "Ingrédient débanni" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
