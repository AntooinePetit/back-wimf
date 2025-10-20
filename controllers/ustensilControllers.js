const db = require("../db");

/**
 * Récupère les informations de tous les ustensiles de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant tous les ustensiles disponibles dans la base de données.
 * @example
 * // GET /api/v1/ustensils
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.getAllUstensils = async (req, res) => {
  try {
    const ustensils = await db.manyOrNone("SELECT * FROM ustensils");

    return res.status(200).json(ustensils);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Permet de rechercher un ou plusieurs ustensiles dans la base de données par leur nom.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant les informations des ustensiles recherchés.
 * @example
 * // GET /api/v1/ustensils/search/couteau
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.searchUstensil = async (req, res) => {
  try {
    const { search } = req.params;

    const splitSearch = search
      .split("+")
      .map((word) => word.trim())
      .filter(Boolean);

    const conditions = splitSearch
      .map((_, idx) => `name_ustensil ILIKE $${idx + 1}`)
      .join(" OR ");

    const values = splitSearch.map((word) => `%${word}%`);

    const searchResult = await db.any(
      `SELECT * FROM ustensils
      WHERE ${conditions}`,
      values
    );

    return res.status(200).json(searchResult);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère le nom de tous les ustensiles utilisés dans une recette
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant les informations des ustensiles utilisés dans la recette sélectionnée.
 * @example
 * // GET /api/v1/ustensils/recipe/1
 */
exports.getUstensilsFromRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      id
    );

    if (!existingRecipe) {
      return res.status(404).json({ message: "Recette introuvable" });
    }

    const ustensils = await db.manyOrNone(
      `SELECT u.name_ustensil FROM recipes_has_ustensils AS r
      LEFT JOIN ustensils AS u
      ON r.fk_id_ustensil = u.id_ustensil
      WHERE r.fk_id_recipe = $1`,
      id
    );

    return res.status(200).json(ustensils);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Ajoute un ustensile à la base de donnée.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant les informations de l'ustensile créé.
 * @example
 * // POST /api/v1/ustensil
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 * {
 *   "name": "Ustensile test"
 * }
 */
exports.addUstensil = async (req, res) => {
  try {
    const { name } = req.body;

    const existingUstensil = await db.oneOrNone(
      "SELECT * FROM ustensils WHERE name_ustensil ILIKE $1",
      name
    );

    if (existingUstensil != null) {
      return res
        .status(409)
        .json({ message: "Cet ustensil est déjà dans la base de donnée" });
    }

    const addedUstensil = await db.one(
      "INSERT INTO ustensils(name_ustensil) VALUES ($1) RETURNING *",
      name
    );

    return res.status(201).json(addedUstensil);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour un ustensile de la base de donnée.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant les informations de l'ustensile mis à jour.
 * @example
 * // PUT /api/v1/ustensil/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 * {
 *   "name": "Ustensile test mis à jour"
 * }
 */
exports.updateUstensil = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingUstensil = await db.oneOrNone(
      "SELECT * FROM ustensils WHERE id_ustensil = $1",
      id
    );

    if (!existingUstensil) {
      return res.status(404).json({ message: "Ustensile introuvable" });
    }

    const existingUstensilName = await db.oneOrNone(
      "SELECT * FROM ustensils WHERE name_ustensil ILIKE $1 AND id_ustensil != $2",
      [name, id]
    );

    if (existingUstensilName) {
      return res
        .status(409)
        .json({ message: "Ce nom d'ustensile est déjà utilisé" });
    }

    const updatedUstensil = await db.oneOrNone(
      `UPDATE ustensils
      SET name_ustensil = $1
      WHERE id_ustensil = $2
      RETURNING *`,
      [name, id]
    );

    return res.status(200).json(updatedUstensil);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un ustensile existant de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 validant la suppression.
 * @example
 * // DELETE /api/v1/ustensils/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.deleteUstensil = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUstensil = await db.result(
      "DELETE FROM ustensils WHERE id_ustensil = $1",
      id
    );

    if (deletedUstensil.rowCount === 0) {
      return res.status(404).json({ message: "Ustensile introuvable" });
    }

    return res.status(204).json({ message: "Ustensile supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Lie un ou plusieurs ustensiles à une recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les liens créés.
 * @example
 * // POST /api/v1/ustensils/link/1+4+5+2
 * // Le premier id doit être l'id de la recette suivi des id des ustensiles à lui ajouter.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */
exports.linkUstensilsToRecipe = async (req, res) => {
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

    const addedUstensils = await db.many(
      `INSERT INTO recipes_has_ustensils (fk_id_recipe, fk_id_ustensil)
      VALUES ${inputs}
      RETURNING *`,
      values
    );

    return res.status(201).json(addedUstensils);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Delie un ustensile d'une recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 pour valider la suppression.
 * @example
 * // DELETE /api/v1/ustensils/link/1+4
 * // Le premier id doit être l'id de la recette et le deuxième l'id de l'ustensile à délier.
 * // Headers : `Authorization: Bearer <votre_jeton_jwt_admin>`
 */

exports.unlinkUstensilFromRecipe = async (req, res) => {
  try {
    const { ids } = req.params;

    const splitIds = ids
      .split("+")
      .map((id) => parseInt(id.trim()))
      .filter(Boolean);

    const deletedUstensils = await db.result(
      `DELETE FROM recipes_has_ustensils
      WHERE fk_id_recipe = $1
      AND fk_id_ustensil = $2`,
      splitIds
    );

    if (deletedUstensils.rowCount === 0) {
      return res.status(404).json({
        message: "Aucun lien entre cette recette et cet ustensile n'a été trouvé",
      });
    }

    return res.status(204).json({ message: "Lien supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
