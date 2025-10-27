// Import fonction
const resetPassMiddleware = require("./resetPassMiddleware");
// Import dépendance
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("resetPassMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT = "test-secret";
  }); // /beforeEach

  afterEach(() => {
    jest.clearAllMocks();
  }); // /afterEach

  it("should verify token and set user's infos in req", () => {
    req = {
      headers: {
        authorization: "Bearer test-token",
      },
    };
    const mockUser = {
      id: 1,
      purpose: "password-reset",
    };

    jwt.verify.mockReturnValue(mockUser);

    resetPassMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("test-token", "test-secret");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  }); // /it

  it("should return 401 if bearer not sent", () => {
    req = {
      headers: {
        authorization: "",
      },
    };

    resetPassMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token manquant !" });
    expect(next).not.toHaveBeenCalled();
  }); // /it

  it("should return 401 if token is invalid", () => {
    req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    };

    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    resetPassMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide ou expiré",
    });
    expect(next).not.toHaveBeenCalled();
  }); // /it
}); // /describe resetPassMiddleware
