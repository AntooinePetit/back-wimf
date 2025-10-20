const express = require("express");
const router = express.Router();

// Implémenter le middleware d'authentification
const authMiddleware = require("../middlewares/authMiddleware.js");
// Implémenter le controller
const bannedControllers = require("../controllers/bannedControllers");

router.get(
  "/:id",
  authMiddleware,
  bannedControllers.getBannedIngredientsFromUser
); // Récupérer tous les ingrédients bannis d'un utilisateur si admin ou utilisateur connecté
// router.post("/:id"); // Ajouter un ingrédient à la liste des ingrédients bannis d'un utilisateur si admin ou utilisateur connecté
// router.delete("/:id"); // Retirer un ingrédient de la liste des ingrédients bannis d'un utilisateur si admin ou utilisateur connecté

module.exports = router;
