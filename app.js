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
const categoryRoutes = require("./routes/categoryRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const tagRoutes = require("./routes/tagRoutes");
const ustensilRoutes = require("./routes/ustensilRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const dietRoutes = require("./routes/dietRoutes");
const bannedRoutes = require("./routes/bannedRoutes");
const authRoutes = require("./routes/authRoutes");

// Recettes
app.use("/api/v1/recipes", recipeRoutes);
// Catégories de recettes
app.use("/api/v1/categories", categoryRoutes);
// Ingrédients
app.use("/api/v1/ingredients", ingredientRoutes);
// Tags
app.use("/api/v1/tags", tagRoutes);
// Ustensiles
app.use("/api/v1/ustensils", ustensilRoutes);
// Reviews
app.use("/api/v1/reviews", reviewRoutes);
// Utilisateurs
app.use("/api/v1/users", userRoutes);
// Régimes
app.use("/api/v1/diets", dietRoutes);
// Ingrédients bannis
app.use("/api/v1/banned", bannedRoutes);
// Authentification
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Rien à voir ici");
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
