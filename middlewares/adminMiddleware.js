const jwt = require("jsonwebtoken");
const db = require("../db");

/**
 * Vérifie le token de connexion de l'utilisateur et si il est bien administrateur.
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction qui renvoie au middleware suivant
 * @returns {void}
 */
const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT);

    const { id } = decoded;

    const userConnected = await db.oneOrNone(
      "SELECT rights_user FROM users WHERE id_user = $1",
      id
    );

    if (!userConnected) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (userConnected.rights_user != "Administrator") {
      return res
        .status(403)
        .json({ message: "Tu ne peux pas réaliser cette action" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = adminMiddleware;
