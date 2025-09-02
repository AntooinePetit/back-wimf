const mongoose = require('mongoose')
const db_url = process.env.MONGO_URL

mongoose.connect(db_url)
.then(() => console.log('Connexion réussie à MongoDB'))
.catch(err => console.log(`Erreur de connexion: ${err}`))

module.exports = mongoose.connection