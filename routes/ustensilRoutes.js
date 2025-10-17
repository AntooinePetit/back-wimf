const express = require("express");
const router = express.Router();

// Importer middleware admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer controllers
const ustensilControllers = require("../controllers/ustensilControllers");

router.get("/", adminMiddleware, ustensilControllers.getAllUstensils); // Récupérer tous les ustensiles
router.get(
  "/search/:search",
  adminMiddleware,
  ustensilControllers.searchUstensil
); // Chercher un ustensile
router.get("/recipe/:id", ustensilControllers.getUstensilsFromRecipe); // Récupérer les ustensiles d'une recette
router.post("/", adminMiddleware, ustensilControllers.addUstensil); // Ajouter un ustensile
router.put("/:id", adminMiddleware, ustensilControllers.updateUstensil); // Mettre à jour un ustensile
router.delete("/:id", adminMiddleware, ustensilControllers.deleteUstensil); // Supprimer un ustensile
router.post(
  "/link/:ids",
  adminMiddleware,
  ustensilControllers.linkUstensilsToRecipe
); // Lier un ou des ustensile à une recette
router.delete(
  "/link/:ids",
  adminMiddleware,
  ustensilControllers.unlinkUstensilFromRecipe
); // Délier un ustensile d'une recette

module.exports = router;
