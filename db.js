const pgp = require('pg-promise')()

const dbURI = process.env.POSTGRESQL_URI

const db = pgp(dbURI)

// variable   → remplacée par cette valeur
db.one('SELECT $1 AS value', 123)
   .then(data => console.log(data))
   .catch(error => console.error(`Erreur : ${error}`))



module.exports = db