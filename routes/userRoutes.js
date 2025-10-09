const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
const authMiddleware = require("../middlewares/authMiddleware");
// Intégrer le controller des utilisateurs
const userControllers = require("../controllers/userControllers");

// // Users
router.get("/", authMiddleware, userControllers.getAllUsers); // récupérer tous les utilisateurs si mod/admin
// router.get("/:id",authMiddleware, userControllers.getOneUser); // récupérer un utilisateur si mod/admin ou soi-même
// router.put("/:id", authMiddleware, userControllers.updateUser); // mise à jour si mod/admin ou soi-même
// router.delete("/:id"); // Suppression/bannissement définitif d'un utilisateur si mod/admin ou soi-même

module.exports = router;
