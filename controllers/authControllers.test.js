// Import des fonctions
const {
  register,
  login,
  forgotPass,
  resetPassword,
} = require("./authControllers");
// Import des models et dépendances
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

jest.mock("jsonwebtoken");
jest.mock("bcrypt");

// const mockNewUser = {
//   id_user: 1,
//   username_user: "testuser",
//   email_user: "test@mail.com",
//   password_user: "hashed_password123",
//   created_at: "2025-10-09T13:33:02.815Z",
//   updated_at: "2025-10-09T13:33:02.815Z",
//   rights_user: "Member",
//   nutritional_values_user: true,
//   caloris_user: true,
// };

// TODO: Ré-écrire les tests pour correspondre aux nouveaux controllers en psql

describe("Auth Controllers", () => {
  const mockDate = new Date("2025-10-09T13:33:02.815Z");

  describe("Register", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          username: "testuser",
          email: "test@mail.com",
          password: "password123",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      process.env.JWT = "test-secret";
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
    }); // /afterEach

    it("should register and connect new user", async () => {
      const mockNewUser = {
        id_user: 1,
        username_user: "testuser",
        email_user: "test@mail.com",
      };

      db.oneOrNone.mockResolvedValue(null);

      bcrypt.genSalt.mockResolvedValue("mock-salt");
      bcrypt.hash.mockResolvedValue("mock-hash");

      db.one.mockResolvedValue(mockNewUser);

      jwt.sign.mockReturnValue("mock-token");

      await register(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email_user = $1 OR username_user = $2",
        ["test@mail.com", "testuser"]
      );
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "mock-salt");
      expect(db.one).toHaveBeenCalledWith(
        `INSERT INTO users (username_user, email_user, password_user, created_at, updated_at, "rights_user") VALUES ($1, $2, $3, $4, $5, 'Member') RETURNING id_user, username_user, email_user`,
        ["testuser", "test@mail.com", "mock-hash", mockDate, mockDate]
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          username: "testuser",
        },
        "test-secret",
        { expiresIn: "7d" }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur connecté avec succès",
        user: {
          id: 1,
          username: "testuser",
          email: "test@mail.com",
        },
        token: "mock-token",
      });
    }); // /it

    it("should return 409 if email or username is alrady taken", async () => {
      const mockExistingUser = {
        id_user: 1,
        username_user: "testuser",
        email_user: "test@mail.com",
      };

      db.oneOrNone.mockResolvedValue(mockExistingUser);

      await register(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu ne peux pas utiliser ce nom d'utilisateur ou cet email.",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await register(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle database insertion error", async () => {
      const mockNewUser = {
        id_user: 1,
        username_user: "testuser",
        email_user: "test@mail.com",
      };

      db.oneOrNone.mockResolvedValue(null);

      bcrypt.genSalt.mockResolvedValue("mock-salt");
      bcrypt.hash.mockResolvedValue("mock-hash");

      db.one.mockRejectedValue(new Error("Database insert error"));

      await register(req, res);

      expect(db.one).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Database insert error",
      });
    });
  }); // /describe Register

  describe("Login", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          email: "test@mail.com",
          password: "password123",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      process.env.JWT = "test-secret";
    }); // /beforeEach

    afterEach(() => {
      jest.clearAllMocks();
    }); // /afterEach

    it("should log user in", async () => {
      const mockUser = {
        id_user: "1",
        email_user: "test@mail.com",
        password_user: "hash-password123",
        username_user: "testuser",
      };
      db.oneOrNone.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock-token");

      await login(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        `SELECT id_user, email_user, password_user, username_user FROM users WHERE email_user = $1`,
        "test@mail.com"
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hash-password123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "1", username: "testuser" },
        "test-secret",
        { expiresIn: "7d" }
      );
      expect(res.json).toHaveBeenCalledWith("mock-token");
    }); // /it

    it("should return error if email doesn't exist", async () => {
      db.oneOrNone.mockResolvedValue(null);

      await login(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cet email n'est lié à aucun compte",
      });
    }); // /it

    it("should return error 401 if password is wrong", async () => {
      const mockUser = {
        id_user: "1",
        email_user: "test@mail.com",
        password_user: "hash-password123",
        username_user: "testuser",
      };

      db.oneOrNone.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hash-password123"
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le mot de passe est incorrect",
      });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await login(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle token generation error", async () => {
      const mockUser = {
        id_user: "1",
        email_user: "test@mail.com",
        password_user: "hash-password123",
        username_user: "testuser",
      };

      db.oneOrNone.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign.mockImplementation(() => {
        throw new Error("Token generation error");
      });

      await login(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hash-password123"
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token generation error",
      });
    });
  }); // /describe Login

  // describe("forgotPass", () => {
  //   let req, res;

  //   beforeEach(() => {
  //     req = {
  //       body: {
  //         email: "test@mail.com",
  //       },
  //     };
  //     res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };
  //     process.env.JWT = "test-secret";
  //   }); // /beforeEach

  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   }); // /afterEach

  //   it("should return a password reset token", async () => {
  //     const mockUser = {
  //       _id: "1",
  //       email: "test@mail.com",
  //     };
  //     User.findOne.mockResolvedValue(mockUser);

  //     jwt.sign.mockReturnValue("mock-token");

  //     await forgotPass(req, res);

  //     expect(User.findOne).toHaveBeenCalledWith({ email: "test@mail.com" });
  //     expect(jwt.sign).toHaveBeenCalledWith(
  //       { id: "1", purpose: "password_reset" },
  //       "test-secret",
  //       { expiresIn: "1h" }
  //     );
  //     expect(res.json).toHaveBeenCalledWith("mock-token");
  //   }); // /it

  //   it("should return error if user not found", async () => {
  //     User.findOne.mockResolvedValue(null);

  //     await forgotPass(req, res);

  //     expect(User.findOne).toHaveBeenCalledWith({ email: "test@mail.com" });
  //     expect(res.status).toHaveBeenCalledWith(404);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Cet email n'est lié à aucun compte",
  //     });
  //   }); // /it

  //   it("should handle token generation error", async () => {
  //     const mockUser = {
  //       _id: "1",
  //       email: "test@mail.com",
  //     };
  //     User.findOne.mockResolvedValue(mockUser);

  //     jwt.sign.mockImplementation(() => {
  //       throw new Error("Token generation error");
  //     });

  //     await forgotPass(req, res);

  //     expect(User.findOne).toHaveBeenCalledWith({ email: "test@mail.com" });
  //     expect(jwt.sign).toHaveBeenCalledWith(
  //       { id: "1", purpose: "password_reset" },
  //       "test-secret",
  //       { expiresIn: "1h" }
  //     );
  //     expect(res.status).toHaveBeenCalledWith(500);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Token generation error",
  //     });
  //   });

  //   it("should handle database error", async () => {
  //     User.findOne.mockRejectedValue(new Error("Database error"));

  //     await forgotPass(req, res);

  //     expect(User.findOne).toHaveBeenCalledWith({ email: "test@mail.com" });
  //     expect(res.status).toHaveBeenCalledWith(500);
  //     expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
  //   }); // /it
  // }); // /describe forgotPass

  // describe("resetPassword", () => {
  //   let req, res;

  //   beforeEach(() => {
  //     req = {
  //       body: {
  //         email: "test@mail.com",
  //         password: "password1234",
  //       },
  //       user: {
  //         id: "1",
  //       },
  //     };
  //     res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };
  //   }); // /beforeEach

  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   }); // /afterEach

  //   it("should reset user's password", async () => {
  //     const mockUserToReset = {
  //       _id: "1",
  //       email: "test@mail.com",
  //       username: "testuser",
  //       password: "password123",
  //       save: jest.fn().mockResolvedValue({
  //         _id: "1",
  //         email: "test@mail.com",
  //         username: "testuser",
  //         password: "mock-hash",
  //       }),
  //     };
  //     User.findById.mockResolvedValue(mockUserToReset);

  //     bcrypt.genSalt.mockResolvedValue("mock-salt");
  //     bcrypt.hash.mockResolvedValue("mock-hash");

  //     await resetPassword(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("1");
  //     expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
  //     expect(bcrypt.hash).toHaveBeenCalledWith("password1234", "mock-salt");
  //     expect(mockUserToReset.password).toBe("mock-hash");
  //     expect(mockUserToReset.save).toHaveBeenCalled();
  //     expect(res.json).toHaveBeenCalledWith({
  //       _id: "1",
  //       email: "test@mail.com",
  //       username: "testuser",
  //       password: "mock-hash",
  //     });
  //   }); // /it

  //   it("should return error if user not found in database", async () => {
  //     User.findById.mockResolvedValue(null);

  //     await resetPassword(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("1");
  //     expect(res.status).toHaveBeenCalledWith(404);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Utilisateur introuvable",
  //     });
  //   }); // /it

  //   it("should handle error if wrong email", async () => {
  //     const mockUserToReset = {
  //       _id: "1",
  //       email: "tost@mail.com",
  //     };
  //     User.findById.mockResolvedValue(mockUserToReset);

  //     await resetPassword(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("1");
  //     expect(res.status).toHaveBeenCalledWith(401);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Tu n'es pas autorisé à réaliser cette action",
  //     });
  //   }); // /it

  //   it("should handle save error", async () => {
  //     const mockUserToReset = {
  //       _id: "1",
  //       email: "test@mail.com",
  //       username: "testuser",
  //       save: jest.fn().mockRejectedValue(new Error("Save error")),
  //     };
  //     User.findById.mockResolvedValue(mockUserToReset);

  //     await resetPassword(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("1");
  //     expect(mockUserToReset.save).toHaveBeenCalled();
  //     expect(res.status).toHaveBeenCalledWith(500);
  //     expect(res.json).toHaveBeenCalledWith({ message: "Save error" });
  //   }); // /it

  //   it("should handle database error", async () => {
  //     User.findById.mockRejectedValue(new Error("Database error"));

  //     await resetPassword(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("1");
  //     expect(res.status).toHaveBeenCalledWith(500);
  //     expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
  //   }); // /it
  // }); // /describe resetPassword
}); // /describe Auth Controller
