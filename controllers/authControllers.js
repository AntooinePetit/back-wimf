const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailForgotPass = require("../utils/mailerForgotPass");

/**
 * Enregistre un nouvel utilisateur dans la base de donnée
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un JSON contenant les informations de l'utilisateur et un token de connexion
 * @example
 * // POST /api/v1/auth/register
 * {
 *  "username": "testuser",
 *  "email": "test@example.com",
 *  "password": "password1234"
 * }
 */
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await db.oneOrNone(
      "SELECT * FROM users WHERE email_user = $1 OR username_user = $2",
      [email, username]
    );

    if (user)
      res.status(409).json({
        message: "Tu ne peux pas utiliser ce nom d'utilisateur ou cet email.",
      });

    const date = new Date();

    const salt = await bcrypt.genSalt(parseInt(12));
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.one(
      `INSERT INTO users (username_user, email_user, password_user, created_at, updated_at, "rights_user") VALUES ($1, $2, $3, $4, $5, 'Member') RETURNING id_user, username_user, email_user`,
      [username, email, passwordHash, date, date]
    );

    const token = jwt.sign(
      {
        id: newUser.id_user,
        username: newUser.username_user,
      },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Utilisateur connecté avec succès",
      user: {
        id: newUser.id_user,
        username: newUser.username_user,
        email: newUser.email_user,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Permet de connecter un utilisateur
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un token de connexion
 * @example
 * // POST /api/v1/auth/login
 * {
 *  "email": "test@example.com",
 *  "password": "password1234"
 * }
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.oneOrNone(
      "SELECT id_user, email_user, password_user, username_user FROM users WHERE email_user ILIKE $1",
      email
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "Cet email n'est lié à aucun compte" });

    const isMatch = await bcrypt.compare(password, user.password_user);
    if (!isMatch)
      return res.status(401).json({ message: "Le mot de passe est incorrect" });

    const token = jwt.sign(
      { id: user.id_user, username: user.username_user },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Génère un token pour permettre à l'utilisateur de réinitialiser son mot de passe oublié
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un token de réinitialisation de mot de passe
 * @example
 * // POST /api/v1/auth/forgot-pass
 * {
 *  "email": "test@example.com"
 * }
 */
exports.forgotPass = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.oneOrNone(
      "SELECT id_user, email_user, username_user FROM users WHERE email_user ILIKE $1",
      email
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "Cet email n'est lié à aucun compte" });

    const token = jwt.sign(
      { id: user.id_user, purpose: "password_reset" },
      process.env.JWT,
      { expiresIn: "15m" }
    );

    const info = await emailForgotPass(email, user.username_user, token);

    console.log(info)

    res.status(200).json({ message: "Email envoyé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Permet de réinitialiser le mot de passe
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un JSON des informations de l'utilisateur dont le mot de passe a été réinitialisé
 * @example
 * // PUT /api/v1/auth/reset-pass
 * // Header: Authorization: Bearer <votre_jeton_jwt>
 * {
 *  "email": "test@example.com",
 *  "password": "newpassword1234"
 * }
 */
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userToReset = await db.oneOrNone(
      "SELECT email_user FROM users WHERE id_user = $1",
      req.user.id
    );

    if (!userToReset)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (email != userToReset.email_user)
      return res
        .status(401)
        .json({ message: "Tu n'es pas autorisé à réaliser cette action" });

    if (password != null) {
      const salt = await bcrypt.genSalt(parseInt(12));
      const passwordHash = await bcrypt.hash(password, salt);

      const updateDate = new Date();

      const userReset = await db.one(
        `UPDATE users 
                  SET "password_user" = $1,
                      "updated_at" = $2  
                  WHERE id_user = $3
                  RETURNING id_user, username_user, email_user`,
        [passwordHash, updateDate, req.user.id]
      );

      res.json(userReset);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
