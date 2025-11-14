const express = require('express')
const router = express.Router()
const aiControllers = require('../controllers/aiControllers')

router.post('/', aiControllers.getIngredientsFromPicture)

module.exports = router