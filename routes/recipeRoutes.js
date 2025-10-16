const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
const adminMiddleware = require("../middlewares/adminMiddleware");
// Intégrer le controller des recettes
const recipeControllers = require("../controllers/recipeControllers");
// TODO: Ajouter une route pour récupérer toutes les recettes correspondants à un tag précis.
router.get("/", recipeControllers.getAllRecipes); // Récupérer toutes les recettes
router.get("/:id", recipeControllers.getOneRecipe); // Récupérer une seule recette
router.get("/search/:search", recipeControllers.searchRecipes); // Recherche des recettes par leur nom
router.post("/", adminMiddleware, recipeControllers.addRecipe); // Ajouter une recette (avec middleware authentification pour vérifier que bien un admin)
router.put("/:id", adminMiddleware, recipeControllers.updateRecipe); // Modifier une recette (avec middleware authentification pour vérifier que bien un admin)
router.delete("/:id", adminMiddleware, recipeControllers.deleteRecipe); // Supprimer une recette (avec middleware authentification pour vérifier que bien un admin)

module.exports = router;
