import nodemailer from "nodemailer";
import environmentVariables from "../environmentVariables.js";

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: environmentVariables.NODEMAILER_USERNAME,
		pass: environmentVariables.NODEMAILER_PASSWORD,
	},
});

async function mailer({ recipientEmail, subject, textMessage, htmlTemplate }) {
	try {
		await transporter.sendMail({
			from: environmentVariables.NODEMAILER_USERNAME,
			to: recipientEmail,
			subject: subject,
			text: textMessage,
			html: htmlTemplate,
		});
	} catch (error) {
		console.error("Error sending OTP email:", error);
		throw new Error("Failed to send OTP!");
	}
}

export default mailer;
