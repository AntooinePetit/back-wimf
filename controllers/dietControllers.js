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

/**
 * Lie un ou plusieurs régimes à un tag.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les liens créés.
 * @example
 * // POST /api/v1/diets/link/tag/1+4+5+2
 * // Le premier id doit être l'id du tag suivi des id des régimes à lui ajouter.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.linkDietToTag = async (req, res) => {
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

    const addedDiets = await db.many(
      `INSERT INTO tags_has_diets (fk_id_tag, fk_id_diet)
      VALUES ${inputs}
      RETURNING *`,
      values
    );

    return res.status(201).json(addedDiets);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Delie un régime d'un tag.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 pour valider la suppression.
 * @example
 * // DELETE /api/v1/diets/link/tag/1+4
 * // Le premier id doit être l'id du tag et le deuxième l'id du régime à délier.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.unlinkDietFromTag = async (req, res) => {
  try {
    const { ids } = req.params;

    const splitIds = ids
      .split("+")
      .map((id) => parseInt(id.trim()))
      .filter(Boolean);

    const deletedUstensils = await db.result(
      `DELETE FROM tags_has_diets
      WHERE fk_id_tag = $1
      AND fk_id_diet = $2`,
      splitIds
    );

    if (deletedUstensils.rowCount === 0) {
      return res.status(404).json({
        message: "Aucun lien entre ce tag et ce régime n'a été trouvé",
      });
    }

    return res.status(204).json({ message: "Lien supprimé" });
  } catch (err) {
    return res.status("500").json({ message: err.message });
  }
};

/**
 * Ajoute un régime à la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations du régime créé.
 * @example
 * // POST /api/v1/diets
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 * {
 *    "name": "Régime de test"
 * }
 */
exports.addDiet = async (req, res) => {
  try {
    const { name } = req.body;

    const existingDietName = await db.oneOrNone(
      `SELECT * FROM diets WHERE name_diet ILIKE $1`,
      name
    );

    if (existingDietName) {
      return res.status(409).json({
        message: "Ce régime est déjà présent dans la base de données",
      });
    }

    const addedDiet = await db.oneOrNone(
      "INSERT INTO diets(name_diet) VALUES($1) RETURNING *",
      name
    );

    return res.status(201).json(addedDiet);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour un régime de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations du régime mis à jour.
 * @example
 * // POST /api/v1/diets/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 * {
 *    "name": "Régime de test mis à jour"
 * }
 */
exports.updateDiet = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const existingDiet = await db.oneOrNone(
      "SELECT * FROM diets WHERE id_diet = $1",
      id
    );

    if (!existingDiet) {
      return res.status(404).json({ message: "Régime introuvable" });
    }

    const existingDietName = await db.oneOrNone(
      "SELECT * FROM diets WHERE name_diet = $1 AND id_diet != $2",
      [name, id]
    );

    if (existingDietName) {
      return res.status(409).json({ message: "Ce régime existe déjà" });
    }

    const updatedDiet = await db.one(
      `UPDATE diets
      SET name_diet = $1
      WHERE id_diet = $2
      RETURNING *`,
      [name, id]
    );

    return res.status(200).json(updatedDiet);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un régime de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 pour valider la suppression.
 * @example
 * // DELETE /api/v1/diets/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.deleteDiet = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDiet = await db.result(
      "DELETE FROM diets WHERE id_diet = $1",
      id
    );

    if (deletedDiet.rowCount === 0) {
      return res.status(404).json({ message: "Régime introuvable" });
    }

    return res.status(204).json({ message: "Régime supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Lie un ou plusieurs régimes à un utilisateur.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les liens créés.
 * @example
 * // POST /api/v1/diets/link/user/1+4+5+2
 * // Le premier id doit être l'id de l'utilisateur suivi des id des régimes à lui ajouter.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.linkDietToUser = async (req, res) => {
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
        message: "Tu n'as pas le droit d'ajouter un régime à cet utilisateur",
      });
    }

    const inputs = splitIds
      .slice(1)
      .map((_, idx) => `($1, $${idx + 2})`)
      .join(", ");

    const values = splitIds.map((id, idx) => parseInt(id));

    const addedDiets = await db.many(
      `INSERT INTO users_has_diets (fk_id_user, fk_id_diet)
      VALUES ${inputs}
      RETURNING *`,
      values
    );
    return res.status(201).json(addedDiets);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
