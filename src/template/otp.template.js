function otpEmailTemplate({ userName, otp }) {
	return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="author" content="Gaurav Singh">
            <meta name="description" content="Talks is a real-time chatting web application built using the MERN stack, and web sockets to enable real-time communication between users.">
            <title>Talks: OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    background: #ffffff;
                    padding: 20px;
                    margin: auto;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin: 20px 0;
                    text-align: center;
                }
                .footer {
                    font-size: 12px;
                    color: #777;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Talks: Your One-Time Verification Code</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Your One-Time Password (OTP) for verification is:</p>
                <p class="otp">${otp}</p>
                <p>This OTP is valid for only 2 minutes. Do not share it with anyone.</p>
                <p class="footer">If you didn't request this, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;
}

export default otpEmailTemplate;
