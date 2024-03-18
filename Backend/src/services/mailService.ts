import nodemailer from "nodemailer";
import config from "../utils/config";

var transporter = nodemailer.createTransport({
  host: "smtp0001.neo.space",
  port: 465,
  secure: true,
  auth: {
    user: "jani.bangiev@atlanticbyte.com",
    pass: config.EMAIL_PASSWORD,
  },
});

export function sendConfirmationMail(url: string, email_address: string) {
  var mailOptions = {
    from: "jani.bangiev@atlanticbyte.com",
    to: email_address,
    subject: "Charge Mate verification",
    test:
      "To verify your Charge Mate account please visit the following url: " +
      url,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
