const jwt = require("jsonwebtoken");

/**
 * Middleware permettant de vérifier le token de réinitialisation de mot de passe
 *
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction qui renvoie au middleware suivant
 * @returns {void}
 */
const resetPassMiddleware = async (req, res, next) => {
  const resetPassHeader = req.headers.authorization;

  if (!resetPassHeader | !resetPassHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant !" });
  }

  const token = resetPassHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = resetPassMiddleware;
