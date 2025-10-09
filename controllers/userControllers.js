const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Récupère tous les utilisateurs dans la base de données si l'utilisateur connecté est un modérateur ou administrateur
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant tous les utilisateurs existant et leurs informations
 * @example
 * // GET /api/users
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
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère un utilisateur spécifique si l'utilisateur connecté est soit modérator ou administrateur, soit propriétaire du compte utilisateur à consulter
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Retourne un JSON contenant les informations de l'utilisateur recherché
 * @example
 * // GET /api/users/:id_de_l_utilisateur
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
      !userConnected
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de consulter ce profil" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met un jour les informations d'un utilisateur donné si l'utilisateur connecté est soit modérateur ou administrateur, soit propriétaire du compte à modifier
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promis<void>} - Retourne les informations du compte modifié
 * @example
 * // PUT /api/users/:id_de_l_utilisateur
 * {
 *  "username": "usertest",
 *  "rights": "Administrator",
 *  "nutritionalValues": false,
 *  "calories": false
 * }
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
      !userConnected
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de modifier ce profil" });
    }

    const { username, email, password, rights, nutritionalValues, calories } =
      req.body;

    let passwordHash;

    if (password != null) {
      const salt = await bcrypt.genSalt(parseInt(12));
      passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await db.one(
      `UPDATE users 
                SET 
                  username_user = $1,
                  email_user = $2,
                  password_user = $3,
                  rights_user = $4,
                  nutritional_values_user = $5,
                  calories_user = $6
                WHERE id_user = $7
                RETURNING id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user`,
      [
        username ?? user.username_user,
        email ?? user.email_user,
        password != null ? passwordHash : user.password_user,
        rights ?? user.rights_user,
        nutritionalValues ?? user.nutritional_values_user,
        calories ?? user.calories_user,
        req.params.id,
      ]
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    // AJOUTER SECURITE DE SUPPRESSION SELON NIVEAU DE COMPTE (EX : MODERATOR PEUT PAS SUPPRIMER ADMINISTRATOR)

    if (
      (userConnected.rights_user === "Member" &&
        userConnected.email_user != userToDelete.email_user) ||
      !userConnected
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de supprimer cet utilisateur" });
    }

    const userDeleted = await db.result('DELETE FROM users WHERE id_user = $1', req.params.id)
    if (userDeleted.rowCount === 0){
      res.status(404).json({message: "Utilisateur introuvable"})
    }

    res.status(200).json({message: "Utilisateur supprimé"})
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
