const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
// Intégrer le controller des utilisateurs
const userControllers = require("../controllers/userControllers");

// // Users
// router.get("/"); // récupérer tous les utilisateurs si mod/admin
// router.get("/:id"); // récupérer un utilisateur si mod/admin ou soi-même
// router.put("/:id"); // mise à jour
// router.delete("/:id"); // Suppression/bannissement définitif d'un utilisateur

module.exports = router;
