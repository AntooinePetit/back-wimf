const User = require("../models/userModel");
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
    const userConnected = await User.findById(req.user.id);

    if (userConnected == null) {
      res.status(401).json({ message: "Tu n'es pas connecté" });
    }

    if (userConnected.rights === "Member") {
      res
        .status(401)
        .json({ message: "Tu n'es pas autorisé à réaliser cette action" });
    }

    const users = await User.find();
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
    const userConnected = await User.findById(req.user.id);

    const user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (
      userConnected.rights === "Member" &&
      userConnected.email != user.email
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
 *  "accessibility": {
 *    "nutritionalValues": false,
 *    "calories": false,
 *    "allergies": ["Noix", "Saumon"],
 *    "diet": ["Végétarien"],
 *    "bannedIngredients": ["Navet"]
 *  }
 * }
 */
exports.updateUser = async (req, res) => {
  try {
    const userConnected = await User.findById(req.user.id);

    const user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (
      userConnected.rights === "Member" &&
      userConnected.email != user.email
    ) {
      return res
        .status(401)
        .json({ message: "Tu n'as pas le droit de modifier ce profil" });
    }

    const { username, email, password, rights, accessibility } = req.body;

    if (username != null) {
      user.username = username;
    }

    if (email != null) {
      user.email = email;
    }

    if (password != null) {
      const salt = await bcrypt.genSalt(parseInt(12));
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }

    if (rights != null) {
      user.rights = rights;
    }

    if (accessibility != null) {
      user.accessibility = accessibility;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
