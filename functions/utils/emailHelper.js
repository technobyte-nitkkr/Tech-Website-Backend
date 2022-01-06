const nodemailer = require("nodemailer");
const functions = require("firebase-functions");
// email helper function which sen email on the based of the optons
const mailHelper = async (options) => {
  // var config = await functions.config();
  // const emailPassword = config.technoemail.password;
  // const emailClientId = config.technoemail.clientid;
  // const emailRefreshToken = config.technoemail.refreshtoken;
  // const emailClientSecret = config.technoemail.clientsecret;
  const emailPassword = process.env.password;
  const emailClientId = process.env.clientid;
  const emailRefreshToken = process.env.refreshtoken;
  const emailClientSecret = process.env.clientsecret;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "noreplytechnobyte@gmail.com",
      pass: emailPassword,
      clientId: emailClientId,
      clientSecret: emailClientSecret,
      refreshToken: emailRefreshToken,
    },
  });

  const message = {
    from: "noreplytechnobyte@gmail.com", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    html: options.html, // html body
  };
  // send mail with defined transport object
  await transporter.sendMail(message, function (err, data) {
    if (err) {
      console.log("Error in sending message:" + err);
      throw err;
    } else {
      console.log("message sent");
      console.log(data.messageId);
    }
  });
};

module.exports = mailHelper;
