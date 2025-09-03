const mongoose = require("mongoose");

const ingredientsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de la recette est requis"],
  },
  preparationTime: {
    type: Number,
    required: [true, "Le temps de préparation est requis"],
  },
  cookingTime: {
    type: Number,
    default: 0,
  },
  restingTime: {
    type: Number,
    default: 0,
  },
  instructions: {
    type: [String],
    required: [true, "Les instructions de la recette sont requises"],
  },
  categories: {
    type: [String],
    required: [true, "Au moins une catégorie est requise"],
  },
  tags: {
    type: [String],
    required: [true, "Au moins un tag est requis"],
  },
  ustensils: {
    type: [String],
  },
  ingredients: {
    type: [ingredientsSchema],
    required: true,
  },
});

module.exports = mongoose.model("Recipes", recipeSchema);
