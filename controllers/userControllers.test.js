// Import des fonctions
const {
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
} = require("./userControllers");
// Import des dépendances
const db = require("../db");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("User controllers", () => {
  const mockDate = new Date("2025-10-09T13:33:02.815Z");

  describe("getAllUsers", () => {
    let req, res;

    beforeEach(() => {
      req = {
        user: {
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

    it("should return all users in database", async () => {
      const mockUser = {
        rights_user: "Moderator",
      };
      const mockUsers = [
        {
          id_user: 1,
          username_user: "testModerator",
          email_user: "test@mail.com",
          created_at: "2025-10-09T13:33:02.815Z",
          updated_at: "2025-10-09T13:33:02.815Z",
          rights_user: "Moderator",
          nutritional_values_user: true,
          calories_user: true,
        },
        {
          id_user: 2,
          username_user: "testUser",
          email_user: "user@mail.com",
          created_at: "2025-10-10T08:53:29.914Z",
          updated_at: "2025-10-10T08:53:29.914Z",
          rights_user: "Member",
          nutritional_values_user: true,
          calories_user: true,
        },
      ];

      db.oneOrNone.mockResolvedValue(mockUser);

      db.many.mockResolvedValue(mockUsers);

      await getAllUsers(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT rights_user FROM users WHERE id_user = $1",
        1
      );
      expect(db.many).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    }); // /it

    it("should handle user not being connected", async () => {
      db.oneOrNone.mockResolvedValue(null);

      await getAllUsers(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'es pas connecté",
      });
    }); // /it

    it("should handle user not being allowed to access users' informations", async () => {
      const mockUser = {
        rights_user: "Member",
      };

      db.oneOrNone.mockResolvedValue(mockUser);

      await getAllUsers(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'es pas autorisé à réaliser cette action",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await getAllUsers(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe getAllUsers

  
}); // /describe User controllers
