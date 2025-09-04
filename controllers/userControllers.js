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
 * // GET /api/users/
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
