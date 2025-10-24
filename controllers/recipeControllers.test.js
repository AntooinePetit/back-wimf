// Import des fonctions
const {
  getAllRecipes,
  getOneRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
} = require("./recipeControllers");
// Import de la base de donnée pour mock
const db = require("../db");

jest.mock("../db.js");

describe("Recipe controllers", () => {
  let req, res;

  describe("getAllRecipes", () => {
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
    }); // /afterEach

    it("should return all recipes informations", async () => {
      const mockRecipes = [
        {
          id_recipe: 1,
          name_recipe: "Boulettes apéritives au cocktail",
          preparation_time: 20,
          cooking_time: 80,
          resting_time: 0,
          instructions: {
            steps: [
              "Préchauffe le four à 175 °C.",
              "Dans un grand bol, mélange le bœuf haché, la chapelure, l’oignon, l’eau et l’œuf. Façonne de petites boulettes et dépose-les sur une feuille de papier cuisson. Enfourne 20 à 25 minutes dans le four préchauffé, en retournant les boulettes à mi-cuisson.",
              "Dans une grande poêle, fais chauffer à feu doux la sauce de canneberge gélifiée, la sauce chili, le sucre brun et le jus de citron, jusqu’à ce que la sauce soit homogène.",
              "Ajoute les boulettes dans la poêle, mélange, puis laisse mijoter environ 1 heure avant de servir.",
            ],
          },
          total_time: 100,
          nutritional_values_recipe: {
            totalFat: {
              name: "Matières grasses totales",
              quantity: 10,
              unit: "g",
            },
            saturatedFat: {
              name: "Acides gras saturés",
              quantity: 4,
              unit: "g",
            },
            cholesterol: {
              name: "Cholestérol",
              quantity: 53,
              unit: "mg",
            },
            sodium: {
              name: "Sodium",
              quantity: 85,
              unit: "mg",
            },
            totalCarbohydrate: {
              name: "Glucides totaux",
              quantity: 15,
              unit: "g",
            },
            dietaryFiber: {
              name: "Fibres alimentaires",
              quantity: 1,
              unit: "g",
            },
            totalSugars: {
              name: "Sucres totaux",
              quantity: 10,
              unit: "g",
            },
            protein: {
              name: "Protéines",
              quantity: 10,
              unit: "g",
            },
            calcium: {
              name: "Calcium",
              quantity: 19,
              unit: "mg",
            },
            iron: {
              name: "Fer",
              quantity: 1,
              unit: "mg",
            },
            potassium: {
              name: "Potassium",
              quantity: 183,
              unit: "mg",
            },
            calories: {
              name: "Calories",
              quantity: 193,
              unit: "kcal",
            },
          },
          servings_recipe: 10,
        },
        {
          id_recipe: 3,
          name_recipe: "Tartinade de saumon fumé",
          preparation_time: 10,
          cooking_time: 0,
          resting_time: 0,
          instructions: {
            steps: [
              "Hache finement le saumon fumé.",
              "Dans un bol, travaille le fromage frais jusqu’à obtenir une texture lisse. Ajoute le saumon, les oignons nouveaux, l’aneth, la sauce Worcestershire et la sauce piquante. Mélange jusqu’à ce que la préparation soit bien homogène.",
            ],
          },
          total_time: 10,
          nutritional_values_recipe: {
            totalFat: {
              name: "Matières grasses totales",
              quantity: 14,
              unit: "g",
            },
            saturatedFat: {
              name: "Acides gras saturés",
              quantity: 9,
              unit: "g",
            },
            cholesterol: {
              name: "Cholestérol",
              quantity: 48,
              unit: "mg",
            },
            sodium: {
              name: "Sodium",
              quantity: 340,
              unit: "mg",
            },
            totalCarbohydrate: {
              name: "Glucides totaux",
              quantity: 1,
              unit: "g",
            },
            protein: {
              name: "Protéines",
              quantity: 8,
              unit: "g",
            },
            calcium: {
              name: "Calcium",
              quantity: 34,
              unit: "mg",
            },
            iron: {
              name: "Fer",
              quantity: 1,
              unit: "mg",
            },
            potassium: {
              name: "Potassium",
              quantity: 99,
              unit: "mg",
            },
            calories: {
              name: "Calories",
              quantity: 164,
              unit: "kcal",
            },
          },
          servings_recipe: 12,
        },
      ];

      db.any.mockResolvedValue(mockRecipes);

      await getAllRecipes(req, res);

      expect(db.any).toHaveBeenCalledWith("SELECT * FROM recipes");
      expect(res.json).toHaveBeenCalledWith(mockRecipes);
    }); // /it

    it("should return null if no recipes in database", async () => {
      db.any.mockResolvedValue(null);

      await getAllRecipes(req, res);

      expect(db.any).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it("should handle database errors", async () => {
      db.any.mockRejectedValue(new Error("Database error"));

      await getAllRecipes(req, res);

      expect(db.any).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe getAllRecipes

  describe("getOneRecipe", () => {
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

    it("should return recipe informations", async () => {
      const mockRecipe = {
        id_recipe: 1,
        name_recipe: "Boulettes apéritives au cocktail",
        preparation_time: 20,
        cooking_time: 80,
        resting_time: 0,
        instructions: {
          steps: [
            "Préchauffe le four à 175 °C.",
            "Dans un grand bol, mélange le bœuf haché, la chapelure, l’oignon, l’eau et l’œuf. Façonne de petites boulettes et dépose-les sur une feuille de papier cuisson. Enfourne 20 à 25 minutes dans le four préchauffé, en retournant les boulettes à mi-cuisson.",
            "Dans une grande poêle, fais chauffer à feu doux la sauce de canneberge gélifiée, la sauce chili, le sucre brun et le jus de citron, jusqu’à ce que la sauce soit homogène.",
            "Ajoute les boulettes dans la poêle, mélange, puis laisse mijoter environ 1 heure avant de servir.",
          ],
        },
        total_time: 100,
        nutritional_values_recipe: {
          totalFat: {
            name: "Matières grasses totales",
            quantity: 10,
            unit: "g",
          },
          saturatedFat: {
            name: "Acides gras saturés",
            quantity: 4,
            unit: "g",
          },
          cholesterol: {
            name: "Cholestérol",
            quantity: 53,
            unit: "mg",
          },
          sodium: {
            name: "Sodium",
            quantity: 85,
            unit: "mg",
          },
          totalCarbohydrate: {
            name: "Glucides totaux",
            quantity: 15,
            unit: "g",
          },
          dietaryFiber: {
            name: "Fibres alimentaires",
            quantity: 1,
            unit: "g",
          },
          totalSugars: {
            name: "Sucres totaux",
            quantity: 10,
            unit: "g",
          },
          protein: {
            name: "Protéines",
            quantity: 10,
            unit: "g",
          },
          calcium: {
            name: "Calcium",
            quantity: 19,
            unit: "mg",
          },
          iron: {
            name: "Fer",
            quantity: 1,
            unit: "mg",
          },
          potassium: {
            name: "Potassium",
            quantity: 183,
            unit: "mg",
          },
          calories: {
            name: "Calories",
            quantity: 193,
            unit: "kcal",
          },
        },
        servings_recipe: 10,
      };
      db.oneOrNone.mockResolvedValue(mockRecipe);

      await getOneRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM recipes WHERE id_recipe = $1",
        1
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipe);
    }); // /it

    it("should return 404 if no recipe's found", async () => {
      db.oneOrNone.mockResolvedValue(null);

      await getOneRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Recette introuvable" });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await getOneRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe getOneRecipe
}); // /describe Recipe controllers
