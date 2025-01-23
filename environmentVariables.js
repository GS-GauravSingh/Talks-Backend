const dotenv = require("dotenv");

// Loading the environment variables from the .env file. If the file (.env file) is present in the project's root then there is no need to specify the path of the .env file. Otherwise, you can pass an object with property "path" and the value of this property is the absolute path to the .env file like this `dotenv.config({path: "/path/to/your/envfile"})`.
dotenv.config();

const environmentVariables = {
    PORT: process.env.PORT || "8000",
    MONGO_DB_URL: process.env.MONGO_DB_URL,
    NODEMAILER_USER_EMAIL: process.env.NODEMAILER_USER_EMAIL,
    NODEMAILER_USER_EMAIL_PASSWORD: process.env.NODEMAILER_USER_EMAIL_PASSWORD,
};

module.exports = environmentVariables;
