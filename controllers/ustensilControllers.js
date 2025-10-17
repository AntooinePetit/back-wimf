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

/**
 * Permet de rechercher un ou plusieurs ustensiles dans la base de données par leur nom.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un json contenant les informations des ustensiles recherchés.
 * @example
 * // GET /api/v1/ustensils/search/couteau
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
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
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
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
