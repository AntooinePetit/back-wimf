const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Récupère tous les utilisateurs dans la base de données si l'utilisateur connecté est un modérateur ou administrateur
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns Retourne un JSON contenant tous les utilisateurs existant et leurs informations
 * @example
 * // GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const userConnected = await User.findById(req.user.id);

    if (userConnected.rights === "Member") {
      return res
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
 * @returns Retourne un JSON contenant les informations de l'utilisateur recherché
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
