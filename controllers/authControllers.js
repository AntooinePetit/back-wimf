const User = require("../models/userModel");
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
    const user = await User.findOne({ email }, { username });

    if (user)
      res.status(200).json({
        message: "Tu ne peux pas utiliser ce nom d'utilisateur ou cet email.",
      });

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
      },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Utilisateur connecté avec succès",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
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
 *  "email": "antoine@mail.com",
 *  "password": "pass1234"
 * }
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ message: "Cet email n'est lié à aucun compte" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Le mot de passe est incorrect" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT,
      { expiresIn: "7d" }
    );
    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
