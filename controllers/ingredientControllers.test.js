// Import des fonctions
const {
  getAllIngredients,
  getIngredientsFromRecipe,
  addIngredient,
  searchIngredients,
  updateIngredient,
  deleteIngredient,
} = require("./ingredientControllers");
// Import de la base de données pour mock
const db = require("../db");

jest.mock("../db.js");

describe("Ingredient controllers", () => {
  let req, res;

  describe("getAllIngredients", () => {
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return all ingredients informations", async () => {
      const mockIngredients = [
        {
          name_ingredient: "Fromage frais",
          name_ingredient_category: "Produits laitiers",
        },
        {
          name_ingredient: "Framboises",
          name_ingredient_category: "Fruits",
        },
      ];
      db.any.mockResolvedValue(mockIngredients);

      await getAllIngredients(req, res);

      expect(db.any).toHaveBeenCalledWith(
        `SELECT i.name_ingredient, c.name_ingredient_category 
      FROM ingredients AS i 
      LEFT JOIN ingredient_categories AS c 
      ON i.fk_id_ingredient_category = c.id_ingredient_category`
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockIngredients);
    }); // /it

    it("should return an empty array if no ingredients in database", async () => {
      db.any.mockResolvedValue([]);

      await getAllIngredients(req, res);

      expect(db.any).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    }); // /it

    it("should handle database error", async () => {
      db.any.mockRejectedValue(new Error("Database error"));

      await getAllIngredients(req, res);

      expect(db.any).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe getAllIngredients
}); // /describe Ingredient controllers
