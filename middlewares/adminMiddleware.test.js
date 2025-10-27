// Importe fonction
const adminMiddleware = require("./adminMiddleware");
// Import dépendances
const db = require("../db");
const jwt = require("jsonwebtoken");

jest.mock("../db.js");
jest.mock("jsonwebtoken");

describe("adminMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer test-token",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.JWT = "test-secret";
    next = jest.fn();
  }); // /beforeEach

  afterEach(() => {
    jest.clearAllMocks();
  }); // /afterEach

  it("should verify if user is administrator and next if true", async () => {
    const mockInfoToken = {
      id: 1,
      username: "testuser",
    };
    const mockUserConnected = {
      rights_user: "Administrator",
    };

    jwt.verify.mockReturnValue(mockInfoToken);

    db.oneOrNone.mockResolvedValue(mockUserConnected);

    await adminMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("test-token", "test-secret");
    expect(db.oneOrNone).toHaveBeenCalledWith(
      "SELECT rights_user FROM users WHERE id_user = $1",
      1
    );
    expect(next).toHaveBeenCalled();
  }); // /it

  it("should return 401 if no authorization bearer in headers", () => {
    req = {
      headers: {
        authorization: "test-token",
      },
    };

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès refusé, token manquant",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it

  it("should return 404 is user can't be found in db", async () => {
    const mockInfoToken = {
      id: 1,
      username: "testuser",
    };

    jwt.verify.mockReturnValue(mockInfoToken);

    db.oneOrNone.mockResolvedValue(null);

    await adminMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(db.oneOrNone).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utilisateur introuvable",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it

  it("should return 403 if user is not administrator", async () => {
    const mockInfoToken = {
      id: 1,
      username: "testuser",
    };
    const mockUserConnected = {
      rights_user: "Moderator",
    };

    jwt.verify.mockReturnValue(mockInfoToken);

    db.oneOrNone.mockResolvedValue(mockUserConnected);

    await adminMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(db.oneOrNone).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tu ne peux pas réaliser cette action",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it

  it("should return 401 if token invalid or expired", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    adminMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide ou expiré",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it

  it("should handle database error", async () => {
    const mockInfoToken = {
      id: 1,
      username: "testuser",
    };

    jwt.verify.mockReturnValue(mockInfoToken);

    db.oneOrNone.mockRejectedValue(new Error("Database error"));

    await adminMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(db.oneOrNone).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    expect(next).not.toHaveBeenCalled();
  }); // /it
}); // /describe adminMiddleware
