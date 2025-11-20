const express = require("express");
const router = express.Router();
// Importer middleware d'authentification admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer controllers
const ingredientControllers = require("../controllers/ingredientControllers");

router.get("/", ingredientControllers.getAllIngredients); // Récupérer tous les ingrédients
router.get("/search/:search", ingredientControllers.searchIngredients); // Rechercher un/des ingrédient(s) par le nom
router.get("/ingredient/:ids", ingredientControllers.getIngredientsByIds); // Récupérer des ingrédients par leurs IDs
router.get("/:id", ingredientControllers.getIngredientsFromRecipe); // Récupérer les ingrédients d'une recette
// Utilisation de middleware d'authentification admin en dessous
router.post("/", adminMiddleware, ingredientControllers.addIngredient); // Ajouter un ingrédient à la liste
router.put("/:id", adminMiddleware, ingredientControllers.updateIngredient); // Mettre à jour un ingrédient
router.delete("/:id", adminMiddleware, ingredientControllers.deleteIngredient); // Supprimer un ingrédient
router.post(
  "/link/:id",
  adminMiddleware,
  ingredientControllers.linkIngredientToRecipe
); // Ajouter un ingrédient à une recette
router.delete(
  "/link/:ids",
  adminMiddleware,
  ingredientControllers.unLinkIngredientFromRecipe
); // Retirer un ingrédient d'une recette

module.exports = router;
