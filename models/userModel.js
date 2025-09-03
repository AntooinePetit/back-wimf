const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// A AJOUTER : PARAMETRES D'ACCESSIBILITE

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Le nom d'utilisateur est requis"],
    unique: true,
    trim: true,
    minlength: [5, "Le nom d'utilisateur doit faire au moins 5 caractères"],
    maxlength: [30, "Le nom d'utilisateur doit faire au maximum 30 caractères"],
    match: [
      /^[a-zA-Z0-9_]+$/,
      "Le nom d'utilisateur ne peut contenir que des chiffres, des lettres et underscores",
    ],
  },
  email: {
    type: String,
    required: [true, "L'adresse email est requise"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/,
      "L'adresse email est invalide",
    ],
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"],
    minlength: [6, "Le mot de passe doit faire au moins 6 caractères"],
  },
  rights: {
    type: String,
    enum: ["Member", "Moderator", "Administrator"],
    default: "Member",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware pour hasher le mot de passe
userSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  if (!this.isModified("username")) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(12));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
