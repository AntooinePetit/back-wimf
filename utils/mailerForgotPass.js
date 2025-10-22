const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function emailForgotPass(email, username, token) {
  const mailOptions = {
    from: `"WIMF" ${process.env.GMAIL_USER}`,
    to: email,
    subject: "Réinitialisation du mot de passe - mot de passe oublié",
    text: `Bonjour ${username},
    
    Nous avons reçu une demande réinitialisation de mot de passe pour ton compte WIMF. Si tu n'es pas à l'origine de cette demande, contente toi d'ignorer ce mail.
    
    Si tu es bien à l'origine de cette demande, voici ton lien de réinitialisation de mot de passe : https://www.wimf.com/reinitialisation/${token} !
    
    Ce lien sera fonctionnel pendant les 15 prochaines minutes !`,
  };

  return transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(`Erreur : ${error}`);
  } else {
    console.log('Email envoyé : ' + info.response);
  }
})
}

module.exports = emailForgotPass;