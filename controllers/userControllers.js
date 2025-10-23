const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * Récupère tous les utilisateurs dans la base de données si l'utilisateur connecté est un modérateur ou administrateur.
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les utilisateurs existant et leurs informations
 * @example
 * // GET /api/v1/users
 * // Header: Authorization: Bearer <votre_jeton_jwt>
 */
exports.getAllUsers = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user FROM users WHERE id_user = $1",
      req.user.id
    );

    if (userConnected == null) {
      res.status(401).json({ message: "Tu n'es pas connecté" });
    }

    if (userConnected.rights_user === "Member") {
      res
        .status(401)
        .json({ message: "Tu n'es pas autorisé à réaliser cette action" });
    }

    const users = await db.many(
      "SELECT id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user FROM users"
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère un utilisateur spécifique si l'utilisateur connecté est soit modérator ou administrateur, soit propriétaire du compte utilisateur à consulter. Si l'utilisateur à consulter a des autorisations plus importantes ou égales que l'utilisateur connecté, une erreur est renvoyée.
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de l'utilisateur recherché
 * @example
 * // GET /api/v1/users/:id_de_l_utilisateur
 * // Header: Authorization: Bearer <votre_jeton_jwt>
 */
exports.getOneUser = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    const user = await db.oneOrNone(
      "SELECT id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user FROM users WHERE id_user = $1",
      req.params.id
    );
    if (user == null) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (
      (userConnected.rights_user === "Member" &&
        userConnected.email_user != user.email_user) ||
      !userConnected ||
      (userConnected.rights_user === "Moderator" &&
        user.rights_user != "Member") ||
      user.rights_user === "Administrator"
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de consulter ce profil" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour les informations d'un utilisateur donné si l'utilisateur connecté est soit modérateur ou administrateur, soit propriétaire du compte à modifier. Si l'utilisateur à mettre à jour a des autorisations plus importantes ou égales que l'utilisateur connecté, une erreur est renvoyée.
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne les informations du compte modifié
 * @example
 * // PUT /api/v1/users/:id_de_l_utilisateur
 * // Header: Authorization: Bearer <votre_jeton_jwt>
 * {
 *  "username": "usertest",
 *  "rights": "Administrator",
 *  "nutritionalValues": false,
 *  "calories": false
 * }
 *
 */
exports.updateUser = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    const user = await db.oneOrNone(
      "SELECT id_user, username_user, password_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user FROM users WHERE id_user = $1",
      req.params.id
    );
    if (user == null) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (
      (userConnected.rights_user === "Member" &&
        userConnected.email_user != user.email_user) ||
      !userConnected ||
      (userConnected.rights_user === "Moderator" &&
        user.rights_user != "Member") ||
      user.rights_user === "Administrator"
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de modifier ce profil" });
    }

    const { username, email, password, rights, nutritionalValues, calories } =
      req.body;

    const existingEmail = await db.oneOrNone(
      "SELECT * FROM users WHERE email_user = $1 AND id_user != $2",
      [email, req.params.id]
    );

    const existingUsername = await db.oneOrNone(
      "SELECT * FROM users WHERE username_user = $1 AND id_user != $2",
      [username, req.params.id]
    );

    if (existingEmail || existingUsername) {
      const conflicts = [
        existingEmail && "Email",
        existingUsername && "Nom d'utilisateur",
      ]
        .filter(Boolean)
        .join(" et ");

      return res.status(409).json({
        message: `${conflicts} indisponible${
          conflicts.includes("et") ? "s" : ""
        }`,
      });
    }

    let passwordHash;

    if (password != null) {
      const salt = await bcrypt.genSalt(parseInt(12));
      passwordHash = await bcrypt.hash(password, salt);
    }

    const date = new Date();

    const updatedUser = await db.one(
      `UPDATE users 
                SET 
                  username_user = $1,
                  email_user = $2,
                  password_user = $3,
                  rights_user = $4,
                  nutritional_values_user = $5,
                  calories_user = $6,
                  updated_at = $7
                WHERE id_user = $8
                RETURNING id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user`,
      [
        username ?? user.username_user,
        email ?? user.email_user,
        password != null ? passwordHash : user.password_user,
        rights ?? user.rights_user,
        nutritionalValues ?? user.nutritional_values_user,
        calories ?? user.calories_user,
        date,
        req.params.id,
      ]
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un utilisateur de la base de donnée si l'utilisateur connecté est soit modérateur ou administrateur, soit propriétaire du compte à supprimer. Si l'utilisateur à supprimer a des autorisations plus importantes ou égales que l'utilisateur connecté, une erreur est renvoyée.
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un message de validation de suppression
 * @example
 * // DELETE /api/v1/users/:id_de_l_utilisateur
 * // Header: Authorization: Bearer <votre_jeton_jwt>
 */
// Suppression d'un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const userConnected = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    const userToDelete = await db.oneOrNone(
      "SELECT rights_user, email_user FROM users WHERE id_user = $1",
      req.params.id
    );

    if (
      (userConnected.rights_user === "Member" &&
        userConnected.email_user != userToDelete.email_user) ||
      !userConnected ||
      (userConnected.rights_user === "Moderator" &&
        userToDelete.rights_user != "Member") ||
      userToDelete.rights_user === "Administrator"
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de supprimer cet utilisateur" });
    }

    const userDeleted = await db.result(
      "DELETE FROM users WHERE id_user = $1",
      req.params.id
    );
    if (userDeleted.rowCount === 0) {
      res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(204).json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
