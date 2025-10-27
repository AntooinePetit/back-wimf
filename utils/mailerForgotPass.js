const nodemailer = require("nodemailer");

async function emailForgotPass(email, username, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"WIMF" ${process.env.GMAIL_USER}`,
    to: email,
    subject: "Réinitialisation du mot de passe - mot de passe oublié",
    text: `Bonjour ${username},
    
Nous avons reçu une demande réinitialisation de mot de passe pour ton compte WIMF. Si tu n'es pas à l'origine de cette demande, contente toi d'ignorer ce mail.
    
Si tu es bien à l'origine de cette demande, voici ton lien de réinitialisation de mot de passe : https://www.wimf.com/reinitialisation/${token} !
    
Ce lien sera fonctionnel pendant les 15 prochaines minutes !`,
  };

  try {
    const info = await transporter.sendMail(mailOptions); // optionnel : tu peux retourner l’info si ton contrôleur en a besoin
    return info;
  } catch (error) {
    // Important : on relance l’erreur pour que le contrôleur puisse la gérer
    throw new Error("Échec de l'envoi de l'email");
  }
}

module.exports = emailForgotPass;
