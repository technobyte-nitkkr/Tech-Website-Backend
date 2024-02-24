const nodemailer = require("nodemailer");
const functions = require("firebase-functions");
// email helper function which sen email on the based of the optons
const mailHelper = async (options) => {
  var config = await functions.config();
  const emailPassword = config.technoemail.password;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreplytechnobyte@gmail.com",
      pass: emailPassword,
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
    return new Promise(async(resolve, reject) => {
      try {
        let info = await transporter.sendMail(message);
        // console.log(info);
        resolve(info.messageId);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

module.exports = mailHelper;
