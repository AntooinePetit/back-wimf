// Import fonction
const authMiddleware = require("./authMiddleware");
// Import dépendance
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
  let req, res, next;
  beforeEach(() => {
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

  it("should decode jwt and add user's informations to req", () => {
    req = {
      headers: {
        authorization: "Bearer jwt-test",
      },
    };
    const mockUser = {
      id: 1,
      username: "testuser",
    };

    jwt.verify.mockReturnValue(mockUser);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("jwt-test", "test-secret");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  }); // /it

  it("should return 401 if no authorization in headers", () => {
    req = {
      headers: {
        authorization: "",
      },
    };

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès refusé, token manquant",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it

  it("should return 401 if token is invalid or expired", () => {
    req = {
      headers: {
        authorization: "Bearer test-token",
      },
    };

    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide ou expiré",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it
}); // /describe authMiddleware
