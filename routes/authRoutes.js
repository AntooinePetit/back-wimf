const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
// Intégrer le controller des utilisateurs
const authControllers = require("../controllers/authControllers");

// Authentification
router.post("/register", authControllers.register); // inscription
router.post("/login", authControllers.login); // connexion
router.post("/forgot-pass", authControllers.forgotPass); // Mot de passe oublié
// router.put("/reset-pass/:token"); // Réinitialisation

module.exports = router