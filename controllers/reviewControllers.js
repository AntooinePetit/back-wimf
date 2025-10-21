const db = require("../db");

/**
 * Permet d'ajouter un commentaire, une note ou les deux à une recette.
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de la review créé.
 * @example
 * // POST /api/v1/reviews/1
 * // Headers : `Authorization: Bearer <votre_jeton_jwt>`
 * {
 *  "comment": "Super recette !",
 *  "note": 4
 * }
 */
exports.postReview = async (req, res) => {
  try {
    const idRecipe = req.params.id;
    const idUser = req.user.id;

    const existingRecipe = await db.oneOrNone(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      idRecipe
    );

    if (!existingRecipe) {
      return res.status(404).json({ message: "Recette introuvable" });
    }

    const { comment, note } = req.body;

    if (!comment && !note) {
      return res.status(400).json({
        message: "Au moins un commentaire ou une note est nécessaire",
      });
    }

    const date = new Date();

    const addedReview = await db.one(
      `INSERT INTO recipe_reviews (fk_id_user, fk_id_recipe, comment_review, note_review, date_review)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [idUser, idRecipe, comment ?? null, note ?? null, date]
    );

    return res.status(201).json(addedReview);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
