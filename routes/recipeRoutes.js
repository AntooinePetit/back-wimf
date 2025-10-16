const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
// Intégrer le controller des recettes
const recipeControllers = require("../controllers/recipeControllers");

router.get("/", recipeControllers.getAllRecipes); // Récupérer toutes les recettes
router.get("/:id", recipeControllers.getOneRecipe); // Récupérer une seule recette
// TODO: Créer/modifier middleware d'authentification et l'intégrer aux routes de créations, mise à jour et suppression de recette
router.post("/", recipeControllers.addRecipe); // Ajouter une recette (avec middleware authentification pour vérifier que bien un admin)
router.put("/:id", recipeControllers.updateRecipe); // Modifier une recette (avec middleware authentification pour vérifier que bien un admin)
router.delete("/:id", recipeControllers.deleteRecipe); // Supprimer une recette (avec middleware authentification pour vérifier que bien un admin)

module.exports = router;
