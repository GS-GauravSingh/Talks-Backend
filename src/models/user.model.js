import mongoose from "mongoose";
import validator from "validator"; // `validator` is a Node.js library used for string sanitization and validation.
import bcrypt, { hash } from "bcryptjs"; // `bcrypt.js` is a library used for hashing passwords.

const userSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: [true, "Firstname is required."],
			trim: true,
		},

		lastname: {
			type: String,
			trim: true,
		},

		jobTitle: {
			type: String,
		},

		bio: {
			type: String,
		},

		country: {
			type: String,
		},

		avatar: {
			type: String, // Cloudinary URL
			default: "",
		},

		email: {
			type: String,
			required: [true, "Email is required."],
			unique: true,

			// Custom Validation
			validate: {
				validator: function (email) {
					// isEmail(): Checks if a string is a valid email or not, if it is a valid email, then it return true. Otherwise, it return false.
					return validator.isEmail(email);
				},

				message: (prop) =>
					`${prop.value} is not a valid email address!`,
			},
		},

		password: {
			type: String,
			required: [true, "Password is required."],
			minLength: [6, "Password must be at least 6 characters."],
			select: false, // this will exclude the password field and is not included when retrieving documents unless explicitly requested.
		},

		passwordChangedAt: {
			type: Date,
		},

		otp: {
			type: String,
		},

		otpExpiryTime: {
			type: Date,
		},

		verified: {
			type: Boolean,
			default: false,
		},

		status: {
			type: String,
			enum: ["ONLINE", "OFFLINE"],
			default: "OFFLINE",
		},
	},
	{ timestamps: true }
);

// Mongoose allows us to define middlewares (also called pre and post hooks) that can be executed before or after certain Mongoose operations like save, remove, updateOne, etc.
userSchema.pre("save", async function (next) {
	const saltRounds = 10; // saltRounds is a number that defines how many times the password hashing algorithm runs to generate a stronger hash.

	// Hash the password before saving the document.
	// `isModified()` is a method used to check whether a particular field in a Mongoose document has been modified/changed or not. If yes, it returns true; otherwise, it returns false.
	if (this.password && this.isModified("password")) {
		const salt = await bcrypt.genSalt(saltRounds); // it will generate a random string used to make password more secure.
		// `bcrypt.hash()`: This function is used to generate a hash of a plaintext password.
		const hashedPassword = await bcrypt.hash(this.password, salt);
		this.password = hashedPassword;
		console.log("Salt: ", salt);
		console.log("Hashed Password: ", hashedPassword);
	}

	// Hash the OTP before saving the document.
	if (this.otp && this.isModified("otp")) {
		const salt = await bcrypt.genSalt(saltRounds); // it will generate a random string used to make password more secure.
		// `bcrypt.hash()`: This function is used to generate a hash of a plaintext password.
		const hashedOTP = await bcrypt.hash(this.otp, salt);
		this.otp = hashedOTP;
		console.log("Salt: ", salt);
		console.log("Hashed OTP: ", hashedOTP);
	}

	next(); // call the next middleware.
});

// Mongoose allows us to define instance methods on schemas.
userSchema.methods.isPasswordCorrect = async function (userEnteredPassword) {
	// `bcrypt.compare()`: This function is used to compare a plaintext with its hashed counterpart. It takes the plaintext password and the hashed password as input parameters and returns a boolean value indicating whether the passwords match.
	return await bcrypt.compare(userEnteredPassword, this.password);
};

userSchema.methods.isOTPCorrect = async function (userEnteredOTP) {
	return await bcrypt.compare(userEnteredOTP, this.otp);
};

userSchema.methods.isTokenValid = function (jwtTimestamp) {
	// If the user has changed their password after the token was issued. Then `this.passwordChangedAt` is not `undefined` it must contain a date object.
	if (this.passwordChangedAt) {
		// JWT timestamps (iat - issued at) are in seconds.
		// Convert JWT timestamp to milliseconds and compare
		return jwtTimestamp * 1000 > this.passwordChangedAt.getTime();
	}

	// if passwordChangedAt is undefined (i.e., the password was never changed after token issuance).
	return true;
};

// Model
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
