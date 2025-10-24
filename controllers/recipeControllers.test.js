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

  describe("addRecipe", () => {
    beforeEach(() => {
      req = {
        body: {
          name: "Recette de test",
          preparationTime: 20,
          cookingTime: 12,
          restingTime: 0,
          instructions: {
            steps: [
              "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
              "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
              "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
              "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
            ],
          },
          nutritionalValues: {
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
          servings: 10,
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

    it("should add new recipe to database", async () => {
      const mockAddedRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test",
        preparation_time: 20,
        cooking_time: 12,
        resting_time: 0,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 32,
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

      db.oneOrNone.mockResolvedValue(null);

      db.one.mockResolvedValue(mockAddedRecipe);

      await addRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM recipes WHERE name_recipe ILIKE $1",
        "Recette de test"
      );
      expect(db.one).toHaveBeenCalledWith(
        `INSERT INTO recipes(name_recipe, preparation_time, cooking_time, resting_time, instructions, total_time, nutritional_values_recipe, servings_recipe) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
        [
          "Recette de test",
          20,
          12,
          0,
          {
            steps: [
              "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
              "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
              "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
              "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
            ],
          },
          32,
          {
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
          10,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recette ajoutée avec succès",
        recipeCreated: mockAddedRecipe,
      });
    }); // /it

    it("should return 409 if recipe name's already taken", async () => {
      const mockExistingRecipe = {
        name_recipe: "recette de test",
      };

      db.oneOrNone.mockResolvedValue(mockExistingRecipe);

      await addRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ce nom de recette est déjà utilisé",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await addRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle insertion error", async () => {
      db.oneOrNone.mockResolvedValue(null);

      db.one.mockRejectedValue(new Error("Insertion error"));

      await addRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.one).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Insertion error" });
    }); // /it
  }); // /describe addRecipe

  describe("updateRecipe", () => {
    beforeEach(() => {
      req = {
        params: {
          id: 1,
        },
        body: {
          name: "Recette de test renommée",
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

    it("should update recipe", async () => {
      const mockExistingRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test",
        preparation_time: 20,
        cooking_time: 12,
        resting_time: 0,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 32,
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
      const mockUpdatedRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test renommée",
        preparation_time: 20,
        cooking_time: 12,
        resting_time: 0,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 32,
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

      db.oneOrNone
        .mockResolvedValueOnce(mockExistingRecipe)
        .mockResolvedValueOnce(null);

      db.one.mockResolvedValue(mockUpdatedRecipe);

      await updateRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM recipes WHERE id_recipe = $1",
        1
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM recipes WHERE name_recipe ILIKE $1 AND id_recipe != $2",
        ["Recette de test renommée", 1]
      );
      expect(db.one).toHaveBeenCalledWith(
        `UPDATE recipes
        SET
          name_recipe = $1,
          preparation_time = $2,
          cooking_time = $3,
          resting_time = $4,
          instructions = $5,
          total_time = $6,
          "nutritional_values_recipe" = $7,
          servings_recipe = $8
        WHERE id_recipe = $9
        RETURNING *`,
        [
          "Recette de test renommée",
          20,
          12,
          0,
          {
            steps: [
              "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
              "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
              "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
              "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
            ],
          },
          32,
          {
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
          10,
          1,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recette mise à jour",
        recipeUpdated: mockUpdatedRecipe,
      });
    }); // /it

    it("should update any data individually", async () => {
      req.body = {
        preparationTime: 32,
        restingTime: 28,
        cookingTime: 20,
      };
      const mockExistingRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test",
        preparation_time: 20,
        cooking_time: 12,
        resting_time: 0,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 32,
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
      const mockUpdatedRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test renommée",
        preparation_time: 32,
        cooking_time: 20,
        resting_time: 28,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 80,
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

      db.oneOrNone
        .mockResolvedValueOnce(mockExistingRecipe)
        .mockResolvedValueOnce(null);

      db.one.mockResolvedValue(mockUpdatedRecipe);

      await updateRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.one).toHaveBeenCalledWith(
        `UPDATE recipes
        SET
          name_recipe = $1,
          preparation_time = $2,
          cooking_time = $3,
          resting_time = $4,
          instructions = $5,
          total_time = $6,
          "nutritional_values_recipe" = $7,
          servings_recipe = $8
        WHERE id_recipe = $9
        RETURNING *`,
        [
          "Recette de test",
          32,
          20,
          28,
          {
            steps: [
              "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
              "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
              "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
              "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
            ],
          },
          80,
          {
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
          10,
          1,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recette mise à jour",
        recipeUpdated: mockUpdatedRecipe,
      });
    }); // /it

    it("should return 404 if recipe to update can't be found", async () => {
      db.oneOrNone.mockResolvedValueOnce(null);

      await updateRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Recette introuvable" });
    }); // /it

    it("should return 409 if recipe name is alredy taken", async () => {
      const mockExistingRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test",
        preparation_time: 20,
        cooking_time: 12,
        resting_time: 0,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 32,
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
      const mockExistingRecipeName = {
        name_recipe: "Recette de test renommée",
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockExistingRecipe)
        .mockResolvedValueOnce(mockExistingRecipeName);

      await updateRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ce nom de recette n'est pas disponible",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await updateRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle update error", async () => {
      const mockExistingRecipe = {
        id_recipe: 1,
        name_recipe: "Recette de test",
        preparation_time: 20,
        cooking_time: 12,
        resting_time: 0,
        instructions: {
          steps: [
            "Pour cuire les œufs durs, dépose-les dans une casserole et recouvre-les d’eau froide, à environ 2,5 cm au-dessus de leur hauteur. Porte l’eau à ébullition, puis retire la casserole du feu. Couvre et laisse reposer 10 à 12 minutes selon la taille des œufs. Égoutte ensuite les œufs et plonge-les dans de l’eau froide pour stopper la cuisson. Écale-les soigneusement.",
            "Coupe les œufs durs en deux dans le sens de la longueur et retire délicatement les jaunes. Dépose-les dans un bol.",
            "Ajoute la mayonnaise, la relish de cornichons et la moutarde. Écrase le tout à la fourchette jusqu’à obtenir une texture lisse. Assaisonne de sel et de poivre selon ton goût, puis ajuste la quantité de mayonnaise ou de moutarde si nécessaire.",
            "À l’aide d’une cuillère ou d’une poche à douille, garnis les blancs d’œufs avec le mélange. Saupoudre de paprika juste avant de servir.",
          ],
        },
        total_time: 32,
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

      db.oneOrNone
        .mockResolvedValueOnce(mockExistingRecipe)
        .mockResolvedValueOnce(null);

      db.one.mockRejectedValue(new Error("Update error"));

      await updateRecipe(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.one).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Update error" });
    }); // /it
  }); // /describe updateRecipe
}); // /describe Recipe controllers
