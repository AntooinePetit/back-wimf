// Import fonction
const mailerForgotPass = require("./mailerForgotPass");
// Import dépendance
const nodemailer = require("nodemailer");

jest.mock("nodemailer");

describe("mailerForgotPass", () => {
  let mockSendMail;
  let email, username, token;

  beforeEach(() => {
    email = "test@mail.com";
    username = "testuser";
    token = "test-token";

    process.env.GMAIL_USER = "sender@gmail.com";
    process.env.GMAIL_PASS = "pass123";

    mockSendMail = jest.fn();

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
  }); // /beforeEach

  afterEach(() => {
    jest.clearAllMocks();
  }); // /afterEach

  it("should call transporter.sendMail with correct mail options", async () => {
    mockSendMail.mockResolvedValue({ accepted: email });

    await mailerForgotPass(email, username, token);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: "sender@gmail.com",
        pass: "pass123",
      },
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: `"WIMF" sender@gmail.com`,
      to: email,
      subject: "Réinitialisation du mot de passe - mot de passe oublié",
      text: expect.stringContaining(`Bonjour ${username},`),
    });
    expect(mockSendMail.mock.calls[0][0].text).toContain(
      `https://www.wimf.com/reinitialisation/${token}`
    );
  }); // /it

  it("should throw an error if sendMail fails", async () => {
    mockSendMail.mockRejectedValue(new Error("SMTP Error"));

    // Vérifie que la fonction relance une erreur propre
    await expect(mailerForgotPass(email, username, token)).rejects.toThrow(
      "Échec de l'envoi de l'email"
    );

    expect(mockSendMail).toHaveBeenCalled();
  });
}); // /describe mailerForgotPass
