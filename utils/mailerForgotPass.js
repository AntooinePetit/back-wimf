const nodemailer = require("nodemailer");

async function emailForgotPass(email, username, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  });

  const mailOptions = {
    from: `"WIMF" ${process.env.GMAIL_USER}`,
    to: email,
    subject: "Réinitialisation du mot de passe - mot de passe oublié",
    text: `Bonjour ${username},
    
Nous avons reçu une demande réinitialisation de mot de passe pour ton compte WIMF. Si tu n'es pas à l'origine de cette demande, contente toi d'ignorer ce mail.
    
Si tu es bien à l'origine de cette demande, voici ton lien de réinitialisation de mot de passe : ${process.env.URL_WEBSITE}/reset-pass/${token} !
    
Ce lien sera fonctionnel pendant les 15 prochaines minutes !`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(error)
    throw new Error("Échec de l'envoi de l'email");
  }
}

module.exports = emailForgotPass;
