const express = require("express");
const helmet = require("helmet");
const app = express();
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const port = process.env.PORT;

// Vérification de l'existence du dossier uploads pour les images
const uploadDirs = ["uploads", "uploads/recipes"];

uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Dossier créé : ${fullPath}`);
  }
});

// Base de données
require("./db");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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
const aiRoutes = require("./routes/aiRoutes");

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
// Analyse IA d'image
app.use("/api/v1/ai", aiRoutes);

// Images
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res, path) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.get("/", (req, res) => {
  res.send("Rien à voir ici");
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
