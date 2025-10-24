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

  describe("searchIngredients", () => {
    beforeEach(() => {
      req = {
        params: {
          search: "Fromage",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
    }); // /afterEach

    it("should return ingredients' informations corresponding to search", async () => {
      const mockSearchResults = [
        {
          name_ingredient: "Fromage frais",
          name_ingredient_category: "Produits laitiers",
        },
      ];

      db.any.mockResolvedValue(mockSearchResults);

      await searchIngredients(req, res);

      expect(db.any).toHaveBeenCalledWith(
        `SELECT i.name_ingredient, c.name_ingredient_category 
      FROM ingredients AS i 
      LEFT JOIN ingredient_categories AS c 
      ON i.fk_id_ingredient_category = c.id_ingredient_category
      WHERE i.name_ingredient ILIKE $1`,
        ["%Fromage%"]
      );
    }); // /it

    it("should return an empty array if no ingredients match search", async () => {
      db.any.mockResolvedValue([]);

      await searchIngredients(req, res);

      expect(db.any).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    }); // /it

    it("should handle database error", async () => {
      db.any.mockRejectedValue(new Error("Database error"));

      await searchIngredients(req, res);

      expect(db.any).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe searchIngredients

  describe("getIngredientsFromRecipe", () => {
    beforeEach(() => {
      req = {
        params: {
          id: 1,
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
    }); // /afterEach

    it("should return all ingredients linked to a recipe", async () => {
      const mockExistingRecipe = {
        id_recipe: 1,
      };
      const mockIngredients = [
        {
          name_ingredient: "Ingrédient de test 1",
          quantity: 60,
          mesurements: "g",
        },
        {
          name_ingredient: "Ingrédient de test 2",
          quantity: 1,
          mesurements: "cuillère à soupe",
        },
        {
          name_ingredient: "Ingrédient de test 3",
          quantity: 180,
          mesurements: "ml",
        },
        {
          name_ingredient: "Ingrédient de test 4",
          quantity: 450,
          mesurements: "g",
        },
        {
          name_ingredient: "Ingrédient de test 5",
          quantity: 2,
          mesurements: "cuillère à café",
        },
        {
          name_ingredient: "Ingrédient de test 6",
          quantity: 1,
          mesurements: "gros",
        },
        {
          name_ingredient: "Ingrédient de test 7",
          quantity: 225,
          mesurements: "g",
        },
        {
          name_ingredient: "Ingrédient de test 8",
          quantity: 2,
          mesurements: "cuillère à soupe",
        },
        {
          name_ingredient: "Ingrédient de test 9",
          quantity: 30,
          mesurements: "g",
        },
      ];

      db.oneOrNone.mockResolvedValue(mockExistingRecipe);

      db.manyOrNone.mockResolvedValue(mockIngredients);

      await getIngredientsFromRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM recipes WHERE id_recipe = $1",
        1
      );
      expect(db.manyOrNone).toHaveBeenCalledWith(
        `SELECT i.name_ingredient, ri.quantity, ri.mesurements FROM recipes_has_ingredients AS ri
      INNER JOIN ingredients AS i ON i.id_ingredient = ri.fk_id_ingredient
      WHERE fk_id_recipe = $1`,
        1
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockIngredients);
    }); // /it

    it("should return 404 if recipe can't be found", async () => {
      db.oneOrNone.mockResolvedValue(null);

      await getIngredientsFromRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Recette introuvable" });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await getIngredientsFromRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe getIngredientsFromRecipe

  describe("addIngredient", () => {
    beforeEach(() => {
      req = {
        body: {
          name: "Ingrédient test",
          category: 1,
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
    }); // /afterEach

    it("should add an ingredient to database", async () => {
      const mockAddedIngredient = {
        name_ingredient: "Ingrédient test",
        fk_id_ingredient_category: 1,
      };

      db.oneOrNone.mockResolvedValue(null);

      db.one.mockResolvedValue(mockAddedIngredient);

      await addIngredient(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM ingredients WHERE name_ingredient ILIKE $1",
        "Ingrédient test"
      );
      expect(db.one).toHaveBeenCalledWith(
        `INSERT INTO 
      ingredients(name_ingredient, fk_id_ingredient_category)
      VALUES ($1, $2)
      RETURNING *`,
        ["Ingrédient test", 1]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingrédient ajouté",
        addedIngredient: mockAddedIngredient,
      });
    }); // /it

    it("should return 409 if ingredient's name already in database", async () => {
      const existingIngredient = {
        name_ingredient: "Ingrédient test",
      };
      db.oneOrNone.mockResolvedValue(existingIngredient);

      await addIngredient(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cet ingrédient existe déjà",
      });
    }); // /it

    it("should return 400 if name or category not sent", async () => {
      req = {
        body: {},
      };

      await addIngredient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le nom et la catégorie doivent être renseignés",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await addIngredient(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle insertion error", async () => {
      db.oneOrNone.mockResolvedValue(null);

      db.one.mockRejectedValue(new Error("Insertion error"));

      await addIngredient(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.one).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Insertion error" });
    }); // /it
  }); // /describe addIngredient
}); // /describe Ingredient controllers
