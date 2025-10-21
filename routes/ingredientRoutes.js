const express = require("express");
const router = express.Router();
// Importer middleware d'authentification admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer controllers
const ingredientControllers = require("../controllers/ingredientControllers");

router.get("/", ingredientControllers.getAllIngredients); // Récupérer tous les ingrédients
router.get("/search/:search", ingredientControllers.searchIngredients); // Rechercher un/des ingrédient(s) par le nom
router.get("/:id", ingredientControllers.getIngrdientsFromRecipe); // Récupérer les ingrédients d'une recette
// Utilisation de middleware d'authentification admin en dessous
router.post("/", adminMiddleware, ingredientControllers.addIngredient); // Ajouter un ingrédient à la liste
router.put("/:id", adminMiddleware, ingredientControllers.updateIngredient); // Mettre à jour un ingrédient
router.delete("/:id", adminMiddleware, ingredientControllers.deleteIngredient); // Supprimer un ingrédient

module.exports = router;
