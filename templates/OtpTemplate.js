const generateOtpEmail = ({ recipientName = "there!", otp }) =>
    `
    <!DOCTYPE html>
    <html>

    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }

            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .email-header {
                background-color: #4caf50;
                color: #ffffff;
                text-align: center;
                padding: 20px;
            }

            .email-body {
                padding: 20px;
                line-height: 1.6;
                color: #333333;
            }

            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #4caf50;
                text-align: center;
                margin: 20px 0;
            }

            .footer {
                text-align: center;
                padding: 20px;
                background-color: #f4f4f4;
                color: #888888;
                font-size: 12px;
            }
        </style>
    </head>

    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Talks - OTP </h1>
            </div>

            <div class="email-body">
                <p>Hi ${recipientName},</p>
                <p>We received a request to verify your email address. Use the OTP below to complete the process:</p>
                <div class="otp">${otp}</div>
                <p>Do not share this OTP with anyone!.</p>
                <p>Thank you</p>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} Talks. All rights reserved.
            </div>
        </div>
    </body>

    </html>
    `;

module.exports = generateOtpEmail;
