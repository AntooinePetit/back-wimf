const express = require("express");
const router = express.Router();

// Implémenter middleware admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Implémenter controllers
const categoryControllers = require("../controllers/categoryControllers");

// router.get('/') // Récupérer les catégories et les recettes liées
// router.post('/link/:ids', adminMiddleware) // Lier une recette à une ou plusieurs catégories
// router.delete('/link/:ids', adminMiddleware) // Délier une recette et une catégorie
// router.get('/:id') // Récupérer les recettes liées à une catégorie

module.exports = router;
