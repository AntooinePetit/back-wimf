const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
// Intégrer le controller des recettes
const recipeControllers = require("../controllers/recipeControllers");

router.get("/", recipeControllers.getAllRecipes); // Récupérer toutes les recettes
router.get("/:id", recipeControllers.getOneRecipe); // Récupérer une seule recette
router.post("/", recipeControllers.addRecipe); // Ajouter une recette (avec middleware authentification pour vérifier que bien un admin)
// router.put("/:id"); // Modifier une recette (avec middleware authentification pour vérifier que bien un admin)
// router.delete("/:id"); // Supprimer une recette (avec middleware authentification pour vérifier que bien un admin)

module.exports = router;
