// Import des fonctions
const {
  register,
  login,
  forgotPass,
  resetPassword,
} = require("./authControllers");
// Import des dépendances
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailForgotPass = require("../utils/mailerForgotPass");

jest.mock("jsonwebtoken");
jest.mock("bcrypt");
jest.mock("../utils/mailerForgotPass.js");
jest.mock("../db.js");

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
        `SELECT id_user, email_user, password_user, username_user FROM users WHERE email_user ILIKE $1`,
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

  describe("forgotPass", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          email: "test@mail.com",
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

    it("should send a mail and return a 200 code", async () => {
      const mockUser = {
        id_user: 1,
        email_user: "test@mail.com",
        username_user: "testuser",
      };

      db.oneOrNone.mockResolvedValue(mockUser);

      jwt.sign.mockReturnValue("mock-token");

      emailForgotPass.mockResolvedValueOnce();

      await forgotPass(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        `SELECT id_user, email_user, username_user FROM users WHERE email_user ILIKE $1`,
        "test@mail.com"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, purpose: "password_reset" },
        "test-secret",
        { expiresIn: "15m" }
      );
      expect(emailForgotPass).toHaveBeenCalledWith(
        "test@mail.com",
        "testuser",
        "mock-token"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Email envoyé" });
    });

    it("should return error if user not found", async () => {
      db.oneOrNone.mockResolvedValue(null);

      await forgotPass(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cet email n'est lié à aucun compte",
      });
    }); // /it

    it("should handle token generation error", async () => {
      const mockUser = {
        id_user: 1,
        email_user: "test@mail.com",
      };
      db.oneOrNone.mockResolvedValue(mockUser);

      jwt.sign.mockImplementation(() => {
        throw new Error("Token generation error");
      });

      await forgotPass(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, purpose: "password_reset" },
        "test-secret",
        { expiresIn: "15m" }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token generation error",
      });
    });

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await forgotPass(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it

    it("should handle mail send error", async () => {
      const mockUser = {
        id_user: 1,
        email_user: "test@mail.com",
      };

      db.oneOrNone.mockResolvedValue(mockUser);

      jwt.sign.mockReturnValue("mock-token");

      emailForgotPass.mockRejectedValue(new Error("SMTP error"));

      await forgotPass(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(emailForgotPass).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "SMTP error" });
    }); // it
  }); // /describe forgotPass

  describe("resetPassword", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          email: "test@mail.com",
          password: "password1234",
        },
        user: {
          id: "1",
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

    it("should reset user's password", async () => {
      const mockUserToReset = {
        email_user: "test@mail.com",
      };

      db.oneOrNone.mockResolvedValue(mockUserToReset);

      bcrypt.genSalt.mockResolvedValue("mock-salt");
      bcrypt.hash.mockResolvedValue("mock-hash");

      const mockUserReset = {
        id_user: 1,
        username_user: "testuser",
        email_user: "test@mail.com",
      };

      db.one.mockResolvedValue(mockUserReset);

      await resetPassword(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        `SELECT email_user FROM users WHERE id_user = $1`,
        "1"
      );
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith("password1234", "mock-salt");
      expect(db.one).toHaveBeenCalledWith(
        `UPDATE users 
                  SET "password_user" = $1,
                      "updated_at" = $2  
                  WHERE id_user = $3
                  RETURNING id_user, username_user, email_user`,
        ["mock-hash", mockDate, "1"]
      );
      expect(res.json).toHaveBeenCalledWith({
        id_user: 1,
        username_user: "testuser",
        email_user: "test@mail.com",
      });
    }); // /it

    it("should return error if user not found in database", async () => {
      db.oneOrNone.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur introuvable",
      });
    }); // /it

    it("should handle error if wrong email", async () => {
      const mockUserToReset = {
        email_user: "test2@mail.com",
      };
      db.oneOrNone.mockResolvedValue(mockUserToReset);

      await resetPassword(req, res);

      expect(db.oneOrNone).toHaveBeenCalledWith(
        `SELECT email_user FROM users WHERE id_user = $1`,
        "1"
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tu n'es pas autorisé à réaliser cette action",
      });
    }); // /it

    it("should handle save error", async () => {
      const mockUserToReset = {
        email_user: "test@mail.com",
      };

      db.oneOrNone.mockResolvedValue(mockUserToReset);

      bcrypt.genSalt.mockResolvedValue("mock-salt");
      bcrypt.hash.mockResolvedValue("mock-hash");

      db.one.mockRejectedValue(new Error("Update error"));

      await resetPassword(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(db.one).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Update error" });
    }); // /it

    it("should handle database error", async () => {
      db.oneOrNone.mockRejectedValue(new Error("Database error"));

      await resetPassword(req, res);

      expect(db.oneOrNone).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    }); // /it
  }); // /describe resetPassword
}); // /describe Auth Controller
