const express = require("express");
const router = express.Router();

// Implémenter le middleware admin
const adminMiddleware = require("../middlewares/adminMiddleware");
// Implémenter le middleware d'authentification
const authMiddleware = require("../middlewares/authMiddleware");
// Implémenter les controllers
const dietControllers = require("../controllers/dietControllers");

router.get("/", dietControllers.getAllDiets); // Récupérer tous les régimes
router.get("/search/:search", dietControllers.searchDiet); // Rechercher un régime
router.post("/link/tag/:ids", adminMiddleware, dietControllers.linkDietToTag); // Lier un régime à un tag
router.delete(
  "/link/tag/:ids",
  adminMiddleware,
  dietControllers.unlinkDietFromTag
); // Délier un régime d'un tag
router.post("/", adminMiddleware, dietControllers.addDiet); // Ajouter un régime
router.put("/:id", adminMiddleware, dietControllers.updateDiet); // Modifier un régime
// router.delete('/:id', adminMiddleware) // Supprimer un régime
// router.post('/link/user/:ids', authMiddleware) // Lier un régime à un utilisateur
// router.delete('/link/user/:ids', authMiddleware) // Délier un régime d'un utilisateur

module.exports = router;
