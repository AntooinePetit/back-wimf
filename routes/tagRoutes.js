const express = require('express')
const router = express.Router()
// Importer le middleware d'admin
const adminMiddleware = require('../middlewares/adminMiddleware')
// Importer le controller
const tagController = require('../controllers/tagControllers')

router.get('/', tagController.getAllTags) // Récupérer tous les tags
// router.get('/search/:search') // Recherche un tag par le nom
// router.get('/recipe/:id') // Récupérer tous les tags correspondant à une recette
// router.post('/', adminMiddleware) // Ajoute un tag
// router.put('/:id', adminMiddleware) // Modifie un tag
// router.delete('/:id', adminMiddleware) // Supprime un tag

module.exports = router