const express = require("express");
const router = express.Router();
// Intégrer le middleware d'authentification
const recipeMiddleware = require('../middlewares/recipeMiddleware')
// Intégrer le controller des recettes
const recipeControllers = require("../controllers/recipeControllers");

router.get("/", recipeControllers.getAllRecipes); // Récupérer toutes les recettes
router.get("/:id", recipeControllers.getOneRecipe); // Récupérer une seule recette
router.get('/search/:search', recipeControllers.searchRecipes) // Recherche des recettes par leur nom
router.post("/", recipeMiddleware, recipeControllers.addRecipe); // Ajouter une recette (avec middleware authentification pour vérifier que bien un admin)
router.put("/:id", recipeMiddleware, recipeControllers.updateRecipe); // Modifier une recette (avec middleware authentification pour vérifier que bien un admin)
router.delete("/:id", recipeMiddleware, recipeControllers.deleteRecipe); // Supprimer une recette (avec middleware authentification pour vérifier que bien un admin)


module.exports = router;
