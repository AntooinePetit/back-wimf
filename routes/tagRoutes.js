const express = require("express");
const router = express.Router();
// Importer le middleware d'admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer le controller
const tagControllers = require("../controllers/tagControllers");

router.get("/", tagControllers.getAllTags); // Récupérer tous les tags
router.get("/search/:search", tagControllers.searchTag); // Recherche un tag par le nom
// TODO: Envisager de récupérer les tags directement dans le controller de récupération de recettes
router.get("/recipe/:id", tagControllers.getTagsFromRecipe); // Récupérer tous les tags correspondant à une recette
router.post("/", adminMiddleware, tagControllers.addTag); // Ajoute un tag
router.put("/:id", adminMiddleware, tagControllers.updateTag); // Modifie un tag
router.delete("/:id", adminMiddleware, tagControllers.deleteTag); // Supprime un tag
router.post("/link/:ids", adminMiddleware, tagControllers.linkTagsToRecipe) // Lier un tag à une recette
// router.delete("/link/:ids", adminMiddleware) // Délier un tag à une recette

module.exports = router;
