import dotenv from "dotenv";

// Loading the environment variables.
dotenv.config();

const environmentVariables = {
	PORT: process.env.PORT || "8000",
	MONGODB_URL: process.env.MONGODB_URL,
	NODEMAILER_USERNAME: process.env.NODEMAILER_USERNAME,
	NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
	NODE_ENV: process.env.NODE_ENV,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default environmentVariables;
