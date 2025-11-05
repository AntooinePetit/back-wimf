// middlewares/multerConfig.js
const multer = require("multer");
const path = require("path");

// Définition du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/recipes/"); // dossier où stocker les images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // nom unique
  },
});

// Filtrage des fichiers (on n’accepte que des images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images JPEG, PNG et WEBP sont autorisées"));
  }
};

// Création du middleware multer
const upload = multer({ storage, fileFilter });

module.exports = upload;
