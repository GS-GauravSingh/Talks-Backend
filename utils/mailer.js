// `nodemailer` npm packge for sending mail.
const nodemailer = require("nodemailer");
const environmentVariables = require("../environmentVariables");

// to send an email we need to create a `transporter` object.
// The `transporter` is the configuration object that connects your application to an email service provider.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // SMTP (Simple Mail Transfer Protocol) is a communication protocol used for sending email. Here we are using Gmail's SMTP server for sending email.
    port: 465, // Port 465 is used for secure SMTP connections using SSL/TLS encryption.
    secure: true, // Indicates that the connection should use TLS/SSL encryption.

    // The auth object in the Nodemailer configuration contains the email address and password (or App Password) of the Gmail account or SMTP account that is sending the email.
    auth: {
        user: environmentVariables.NODEMAILER_USER_EMAIL, // sender's email address
        pass: environmentVariables.NODEMAILER_USER_EMAIL_PASSWORD, // sender's email app password (this is not your email id password, it an app password, you have to generate this).
    },
});

// Method to send an email.
async function sendMail({ receiverEmail, subject, text, htmlMessage }) {
    // configure mail options.
    const mailOptions = {
        from: environmentVariables.NODEMAILER_USER_EMAIL, // sender's email address.
        to: receiverEmail, // receiver's email address.
        subject: subject, // subject of the email.
        text: text, // simple text message for email
        html: htmlMessage, // HTML version of email message, it supports text formatting that why some people prefer this type of message. If both text and html is used, then HTML message takes precedence.
    };

    try {
        // `sendMail()` method is used to email's. This methods return a promise.
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: ", info);
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Error sending email.");
    }
}

module.exports = sendMail;
