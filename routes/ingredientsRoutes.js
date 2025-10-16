const express = require("express");
const router = express.Router();
// Importer middleware d'authentification admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer controllers
const ingredientsControllers = require("../controllers/ingredientsControllers");

router.get("/", ingredientsControllers.getAllIngredients); // Récupérer tous les ingrédients
router.get("/search/:search", ingredientsControllers.searchIngredients); // Rechercher un/des ingrédient(s) par le nom
// Utilisation de middleware d'authentification admin en dessous
router.post("/", adminMiddleware, ingredientsControllers.addIngredient); // Ajouter un ingrédient à la liste
// router.put('/:id', adminMiddleware) // Mettre à jour un ingrédient
// router.delete('/:id', adminMiddleware) // Supprimer un ingrédient

module.exports = router;
