const express = require("express");
const router = express.Router();
// Importer le middleware d'admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Importer le controller
const tagController = require("../controllers/tagControllers");

router.get("/", tagController.getAllTags); // Récupérer tous les tags
router.get("/search/:search", tagController.searchTag); // Recherche un tag par le nom
// TODO: Envisager de récupérer les tags directement dans le controller de récupération de recettes
router.get("/recipe/:id", tagController.getTagsFromRecipe); // Récupérer tous les tags correspondant à une recette
router.post("/", adminMiddleware, tagController.addTag); // Ajoute un tag
router.put('/:id', adminMiddleware, tagController.updateTag) // Modifie un tag
// router.delete('/:id', adminMiddleware) // Supprime un tag

module.exports = router;
