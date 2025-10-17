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

/**
 * Récupère les tags correspondant à la recherche envoyée.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les tags correspondants à la recherche sur l'application.
 * @example
 * // GET /api/v1/tags/search/viande
 */
exports.searchTag = async (req, res) => {
  try {
    const { search } = req.params;

    // Coupe à chaque "+" dans les paramètres, puis assure qu'il n'y a aucun espace autour de chaque mot, et ne compte pas les mots "vides" (par exemple si la recherche est "moutarde++dijon", supprime le contenu entre les deux '+')
    const splitSearch = search
      .split("+")
      .map((word) => word.trim())
      .filter(Boolean);

    const conditions = splitSearch
      .map((_, idx) => `name_tag ILIKE $${idx + 1}`)
      .join(" OR ");

    const values = splitSearch.map((word) => `%${word}%`);

    const searchResult = await db.any(
      `SELECT * FROM tags
      WHERE ${conditions}`,
      values
    );

    return res.status(200).json(searchResult);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère les tags liés à une recette
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations des tags liés à la recette voulue.
 * @example
 * // GET /api/v1/tags/recipe/1
 */
exports.getTagsFromRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      id
    );

    if (!existingRecipe) {
      return res.status(404).json({ message: "Recette introuvable" });
    }

    const tags = await db.manyOrNone(
      `SELECT t.name_tag FROM tags AS t 
      INNER JOIN recipes_has_tags AS r
      ON t.id_tag = r.fk_id_tag
      WHERE r.fk_id_recipe = $1`,
      id
    );

    return res.status(200).json(tags);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Ajoute un tag à la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant un message de validation et les informations du tag ajouté.
 * @example
 * // POST /api/v1/tags/
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 * {
 *  "name": "Tag test"
 * }
 */
exports.addTag = async (req, res) => {
  try {
    const { name } = req.body;

    const existingTag = await db.oneOrNone(
      "SELECT * FROM tags WHERE name_tag ILIKE $1",
      name
    );

    if (existingTag != null) {
      return res.status(409).json({ message: "Ce tag existe déjà" });
    }

    const newTag = await db.one(
      `INSERT INTO tags(name_tag)
      VALUES ($1)
      RETURNING *`,
      name
    );

    return res.status(201).json({ message: "Tag ajouté", newTag });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour un tag existant de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant un message de validation et les informations du tag mis à jour.
 * @example
 * // PUT /api/v1/tags/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 * {
 *  "name": "Tag test renommé"
 * }
 */
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingTag = await db.oneOrNone(
      "SELECT * FROM tags WHERE id_tag = $1",
      id
    );

    if (!existingTag) {
      return res.status(404).json({ message: "Tag introuvable" });
    }

    const existingTagName = await db.oneOrNone(
      "SELECT * FROM tags WHERE name_tag ILIKE $1 AND id_tag != $2",
      [name, id]
    );

    if (existingTagName != null) {
      return res.status(409).json({ message: "Ce tag existe déjà" });
    }

    const updatedTag = await db.one(
      `UPDATE tags 
      SET name_tag = $1
      WHERE id_tag = $2
      RETURNING *`,
      [name, id]
    );

    return res.status(201).json({ message: "Tag mis à jour", updatedTag });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un tag existant de la base de données.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un code 204 validant la suppression.
 * @example
 * // DELETE /api/v1/tags/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 */
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTag = await db.result(
      "DELETE FROM tags WHERE id_tag = $1",
      id
    );

    if (deletedTag.rowCount === 0) {
      return res.status(404).json({ message: "Tag introuvable" });
    }

    return res.status(204).json({ message: "Tag supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
