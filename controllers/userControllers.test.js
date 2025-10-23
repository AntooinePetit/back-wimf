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

  describe("getOneUser", () => {
    let req, res;

    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
        params: {
          id: 2,
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

    it("should get searched user", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      await getOneUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT rights_user FROM users WHERE id_user = $1",
        1
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user FROM users WHERE id_user = $1",
        2
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    }); // /it

    it("should return 404 if user not found", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(null);

      await getOneUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur introuvable",
      });
    }); // /it

    it("should return 401 if user has no right to access informations", async () => {
      const mockUserConnected = {
        rights_user: "Member",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Moderator",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      await getOneUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'as pas le droit de consulter ce profil",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await getOneUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  }); // /describre getOneUser

  describe("updateUser", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          username: "testUserUpdated",
          email: "userupdated@mail.com",
          password: "updated-password123",
          rights: "Moderator",
          nutritionalValues: false,
          calories: false,
        },
        user: {
          id: 1,
        },
        params: {
          id: 2,
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
    }); // /afterEach

    it("should update user's informations", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockUpdatedUser = {
        id_user: 2,
        username_user: "testUserUpdated",
        email_user: "userupdated@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: mockDate,
        rights_user: "Moderator",
        nutritional_values_user: false,
        calories_user: false,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      bcrypt.genSalt.mockResolvedValue("mock-salt");
      bcrypt.hash.mockResolvedValue("mock-hash");

      db.one.mockResolvedValue(mockUpdatedUser);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT rights_user FROM users WHERE id_user = $1",
        1
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT id_user, username_user, password_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user FROM users WHERE id_user = $1",
        2
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email_user ILIKE $1 AND id_user != $2",
        ["userupdated@mail.com", 2]
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username_user ILIKE $1 AND id_user != $2",
        ["testUserUpdated", 2]
      );
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        "updated-password123",
        "mock-salt"
      );
      expect(db.one).toHaveBeenCalledWith(
        `UPDATE users 
                SET 
                  username_user = $1,
                  email_user = $2,
                  password_user = $3,
                  rights_user = $4,
                  nutritional_values_user = $5,
                  calories_user = $6,
                  updated_at = $7
                WHERE id_user = $8
                RETURNING id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user`,
        [
          "testUserUpdated",
          "userupdated@mail.com",
          "mock-hash",
          "Moderator",
          false,
          false,
          mockDate,
          2,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    }); // /it

    it("should update user's information even if fields are empty", async () => {
      req = {
        body: {},
        user: {
          id: 1,
        },
        params: {
          id: 2,
        },
      };

      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockUpdatedUser = {
        id_user: 2,
        username_user: "testUserd",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: mockDate,
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      db.one.mockResolvedValue(mockUpdatedUser);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT rights_user FROM users WHERE id_user = $1",
        1
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT id_user, username_user, password_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user FROM users WHERE id_user = $1",
        2
      );
      expect(db.one).toHaveBeenCalledWith(
        `UPDATE users 
                SET 
                  username_user = $1,
                  email_user = $2,
                  password_user = $3,
                  rights_user = $4,
                  nutritional_values_user = $5,
                  calories_user = $6,
                  updated_at = $7
                WHERE id_user = $8
                RETURNING id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user`,
        [
          "testUser",
          "user@mail.com",
          "password123",
          "Member",
          true,
          true,
          mockDate,
          2,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it("should return 404 if user to update can't be found", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(null);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur introuvable",
      });
    }); // /it

    it("should return 401 if user has no right to access informations", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Moderator",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'as pas le droit de modifier ce profil",
      });
    }); // /it

    it("should return 401 if member tries to update another member", async () => {
      const mockUserConnected = {
        rights_user: "Member",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'as pas le droit de modifier ce profil",
      });
    });

    it("should return 409 if email and username already taken", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockEmailExisting = { email_user: "userupdated@mail.com" };
      const mockUsernameExisting = { username_user: "testUserUpdated" };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockEmailExisting)
        .mockResolvedValueOnce(mockUsernameExisting);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email_user ILIKE $1 AND id_user != $2",
        ["userupdated@mail.com", 2]
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username_user ILIKE $1 AND id_user != $2",
        ["testUserUpdated", 2]
      );
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email et Nom d'utilisateur indisponibles",
      });
    }); // /it

    it("should return 409 if email already taken", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockEmailExisting = { email_user: "userupdated@mail.com" };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockEmailExisting)
        .mockResolvedValueOnce(null);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email_user ILIKE $1 AND id_user != $2",
        ["userupdated@mail.com", 2]
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username_user ILIKE $1 AND id_user != $2",
        ["testUserUpdated", 2]
      );
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email indisponible",
      });
    }); // /it

    it("should return 409 if username already taken", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockUsernameExisting = { username_user: "testUserUpdated" };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUsernameExisting);

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email_user ILIKE $1 AND id_user != $2",
        ["userupdated@mail.com", 2]
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username_user ILIKE $1 AND id_user != $2",
        ["testUserUpdated", 2]
      );
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nom d'utilisateur indisponible",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle update error", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      bcrypt.genSalt.mockResolvedValue("mock-salt");
      bcrypt.hash.mockResolvedValue("mock-hash");

      db.one.mockRejectedValue(new Error("Update error"));

      await updateUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        "updated-password123",
        "mock-salt"
      );
      expect(db.one).toHaveBeenCalledWith(
        `UPDATE users 
                SET 
                  username_user = $1,
                  email_user = $2,
                  password_user = $3,
                  rights_user = $4,
                  nutritional_values_user = $5,
                  calories_user = $6,
                  updated_at = $7
                WHERE id_user = $8
                RETURNING id_user, username_user, email_user, created_at, updated_at, rights_user, nutritional_values_user, calories_user`,
        [
          "testUserUpdated",
          "userupdated@mail.com",
          "mock-hash",
          "Moderator",
          false,
          false,
          mockDate,
          2,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Update error" });
    }); // /it
  }); // /describe updateUser

  describe("deleteUser", () => {
    let req, res;

    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
        params: {
          id: 2,
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

    it("should delete user from database", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockResult = {
        rowCount: 1,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      db.result.mockResolvedValue(mockResult);

      await deleteUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT rights_user FROM users WHERE id_user = $1",
        1
      );
      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT rights_user FROM users WHERE id_user = $1",
        2
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur supprimé",
      });
    }); // /it

    it("should return 401 if user has no rights to delete", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Moderator",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      await deleteUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'as pas le droit de supprimer cet utilisateur",
      });
    }); // /it

    it("should return 401 if member tries to delete another user", async () => {
      const mockUserConnected = {
        rights_user: "Member",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      await deleteUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'as pas le droit de supprimer cet utilisateur",
      });
    });

    it("should return 404 if user to delete can't be found", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };
      const mockResult = {
        rowCount: 0,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      db.result.mockResolvedValue(mockResult);

      await deleteUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.result).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur introuvable",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await deleteUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle deletion error", async () => {
      const mockUserConnected = {
        rights_user: "Moderator",
      };
      const mockUser = {
        id_user: 2,
        username_user: "testUser",
        password_user: "password123",
        email_user: "user@mail.com",
        created_at: "2025-10-10T08:53:29.914Z",
        updated_at: "2025-10-10T08:53:29.914Z",
        rights_user: "Member",
        nutritional_values_user: true,
        calories_user: true,
      };

      db.oneOrNone
        .mockResolvedValueOnce(mockUserConnected)
        .mockResolvedValueOnce(mockUser);

      db.result.mockRejectedValue(new Error("Deletion error"));

      await deleteUser(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.result).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Deletion error" });
    });
  }); // /describe deleteUser
}); // /describe User controllers
