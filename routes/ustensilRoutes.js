const express = require("express");
const router = express.Router();

// Importer middleware admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer controllers
const ustensilControllers = require("../controllers/ustensilControllers");

// router.get("/", adminMiddleware); // Récupérer tous les ustensiles
// router.get("/:id", adminMiddleware); // Récupérer un ustensile
// router.get("/recipe/:id"); // Récupérer les ustensiles d'une recette
// router.post("/", adminMiddleware); // Ajouter un ustensile
// router.put("/:id", adminMiddleware); // Mettre à jour un ustensile
// router.delete("/:id", adminMiddleware); // Supprimer un ustensile
// router.post("/link/:ids", adminMiddleware); // Lier un ou des ustensile à une recette
// router.delete("/link/:ids", adminMiddleware); // Délier un ustensile d'une recette

module.exports = router