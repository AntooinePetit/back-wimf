const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
// Intégrer le controller des utilisateurs
const userControllers = require("../controllers/userControllers");

router.post("/register");
router.post("/login");

module.exports = router;
