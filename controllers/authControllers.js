const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Enregistre un nouvel utilisateur dans la base de donnée
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un JSON contenant les informations de l'utilisateur et un token de connexion
 * @example
 * // POST /api/auth/register
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
      res.status(200).json({
        message: "Tu ne peux pas utiliser ce nom d'utilisateur ou cet email.",
      });

    const date = new Date();

    const salt = await bcrypt.genSalt(parseInt(12));
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.one(
      `INSERT INTO users (username_user, email_user, password_user, created_at, updated_at, "rights_user") VALUES ($1, $2, $3, $4, $5, 'Member') RETURNING *`,
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
 * // POST /api/auth/login
 * {
 *  "email": "test@example.com",
 *  "password": "password1234"
 * }
 */
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user)
//       return res
//         .status(404)
//         .json({ message: "Cet email n'est lié à aucun compte" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Le mot de passe est incorrect" });

//     const token = jwt.sign(
//       { id: user._id, username: user.username },
//       process.env.JWT,
//       { expiresIn: "7d" }
//     );
//     res.json(token);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

/**
 * Génère un token pour permettre à l'utilisateur de réinitialiser son mot de passe oublié
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un token de réinitialisation de mot de passe
 * @example
 * // POST /api/auth/forgot-pass
 * {
 *  "email": "test@example.com"
 * }
 */
// exports.forgotPass = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user)
//       return res
//         .status(404)
//         .json({ message: "Cet email n'est lié à aucun compte" });

//     const token = jwt.sign(
//       { id: user._id, purpose: "password_reset" },
//       process.env.JWT,
//       { expiresIn: "1h" }
//     );

//     res.json(token);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

/**
 * Permet de réinitialiser le mot de passe
 *
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} - Répond avec un JSON des informations de l'utilisateur dont le mot de passe a été réinitialisé
 * @example
 * // PUT /api/auth/reset-pass
 * {
 *  "email": "test@example.com",
 *  "password": "newpassword1234"
 * }
 */
// exports.resetPassword = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const userToReset = await User.findById(req.user.id);

//     if (!userToReset)
//       return res.status(404).json({ message: "Utilisateur introuvable" });

//     if (email != userToReset.email)
//       return res
//         .status(401)
//         .json({ message: "Tu n'es pas autorisé à réaliser cette action" });

//     if (password != null) {
//       const salt = await bcrypt.genSalt(parseInt(12));
//       const passwordHash = await bcrypt.hash(password, salt);
//       userToReset.password = passwordHash;

//       userToReset.updatedAt = Date.now();
//     }

//     const resetUser = await userToReset.save();
//     res.json(resetUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
