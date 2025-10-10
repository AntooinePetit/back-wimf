const express = require("express");
const helmet = require("helmet");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

// Base de données
require("./db");

// Middleware pour parse le JSON
app.use(express.json());

// Helmet
app.use(helmet());

// Intégration des routes
const recipeRoutes = require("./routes/recipeRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Rien à voir ici");
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
