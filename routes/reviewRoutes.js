const express = require("express");
const router = express.Router();

// Implémenter middleware d'authentification
const authMiddleware = require("../middlewares/authMiddleware");
// Implémenter les controllers
const reviewControllers = require("../controllers/reviewControllers");

router.post("/:id", authMiddleware, reviewControllers.postReview); // Poster une review sur une recette
router.delete("/:id", authMiddleware, reviewControllers.deleteReview); // Supprimer une review d'une recette
// router.post("/report/:id", authMiddleware); // Signaler une review (envoi de mail à un email de modération ?)
// router.get("/recipe/:id"); // Récupérer toutes les reviews d'une recette
// router.get("/user/:id", authMiddleware); // Récupérer toutes les reviews d'un utilisateur (mod/admin)

module.exports = router;
