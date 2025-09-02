const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Rien à voir ici");
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
