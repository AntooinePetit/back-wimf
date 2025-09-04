const mongoose = require("mongoose");

const nutritionalSchema = new mongoose.Schema({
  energy: {
    type: Number,
  },
  proteins: {
    type: Number,
  },
  lipids: {
    type: Number,
  },
  fibers: {
    type: Number,
  },
  carbohydrates: {
    type: Number,
  },
  saturatedFats: {
    type: Number,
  },
  sugar: {
    type: Number,
  },
  salt: {
    type: Number,
  },
});

const ingredientsSchema = new mongoose.Schema(
  {
    idIngredient: {
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
  picture: {
    type: String,
  },
  calories: {
    type: Number,
  },
  nutrionalValues: {
    type: nutritionalSchema,
  },
});

module.exports = mongoose.model("Recipes", recipeSchema);
