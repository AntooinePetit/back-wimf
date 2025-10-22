// Mock de la base de données PostgreSQL (pg-promise)
jest.mock("./db", () => ({
  one: jest.fn(),
  oneOrNone: jest.fn(),
  many: jest.fn(),
  manyOrNone: jest.fn(),
  any: jest.fn(),
  result: jest.fn(),
}));
