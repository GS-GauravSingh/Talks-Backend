import UserModel from "../models/user.model.js";
import otpEmailTemplate from "../template/otp.template.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import otpGenerator from "otp-generator";
import mailer from "../utils/mailer.js";
import { generateJwtToken, verifyJwtToken } from "../utils/Jwt.js";
import environmentVariables from "../environmentVariables.js";

// Register new user.
export const register = asyncHandler(async (req, res, next) => {
	// get the user details from the `req.body`.
	const { firstname, lastname, email, password } = req.body;

	// Simple check: When required fields are missing.
	if (!firstname || !email || !password) {
		throw new CustomError(
			"Some required fields are missing! All fields are required, excluding lastname, which is optional.",
			400
		);
	}

	// Check whether an account already exists with the given email or not
	const accountAlreadyExists = await UserModel.findOne({ email });

	if (accountAlreadyExists && accountAlreadyExists.verified) {
		// Account already exisits and is verified.
		throw new CustomError("Account already exists! Login Instead.", 400);
	}

	// Case 1: If the account exists and is not verified. In this case, we delete the previous un-verified accunt and create a new one.
	// Case 2: If the account doesn't exists. In this case, we simple create a new account.
	if (accountAlreadyExists && !accountAlreadyExists.verified) {
		await UserModel.deleteOne({ email });
	}

	// Creating a new account.
	const user = await UserModel.create({
		firstname,
		lastname,
		email,
		password,
	});

	req._id = user._id; // attach the user id to request object.
	next(); // pass the flow to the next middleware on the middleware stack.
});

// Send OTP to the user's email address.
export const sendOTP = asyncHandler(async (req, res, next) => {
	// take out the user id from the request object.
	const { _id } = req;

	// find the user using the _id.
	const user = await UserModel.findById(_id);

	// Generate a 4-digit OTP using the otp-generator npm package.
	const otp = otpGenerator.generate(4, {
		lowerCaseAlphabets: false,
		specialChars: false,
		upperCaseAlphabets: false,
	});

	// store the otp in the user document.
	user.otp = otp;
	user.otpExpiryTime = Date.now() + 2 * 60 * 1000; // Once the OTP is generated, it will expire after 2 minutes.

	// save the changes.
	// this way of saving the documnet will trigger the pre save middleware and it will automatically hash the OTP before storing into the database.
	await user.save({
		validateModifiedOnly: true /* run validation on updated fields only. */,
	});

	// Send the OTP to the user's email address.
	const firstName =
		user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1);

	const lastName = user.lastname
		? user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1)
		: "";

	const userName = `${firstName} ${lastName}`.trim();
	const otpEmail = otpEmailTemplate({ userName, otp });
	await mailer({
		recipientEmail: user.email,
		subject: "Talks: OTP for verification",
		textMessage: `Your OTP for Talks is: ${otp}.`,
		htmlTemplate: otpEmail,
	});

	// if we reach here, it means OTP sent successfully.
	return res.status(200).json({
		status: "success",
		message: "OTP sent successfully!",
	});
});

// Verify the OTP sent to the user's email address.
export const verifyOTP = asyncHandler(async (req, res, next) => {
	const { email, otp } = req.body;

	if (!email || !otp) {
		throw new CustomError(
			"Some required fields are missing! Both email and OTP is required.",
			400
		);
	}

	// find the user using the provided email address.
	// if otpExpiryTime is greater than current time, it means that OTP hasn't expired yet because otpExpiryTime is storing the time at which OTP is created.
	const user = await UserModel.findOne({
		email,
		otpExpiryTime: { $gt: Date.now() },
	}).select("-password");

	// If we are unable to find the user document, it means the OTP has expired.
	if (!user) {
		// OTP has expired.
		throw new CustomError("The OTP has expired!", 400);
	}

	// Check whether user is already verified.
	if (user.verified) {
		throw new CustomError("Email is already verified! Login Instead.", 400);
	}

	// Now we have to check whether the user enters the correct OTP or not.
	if (!(await user.isOTPCorrect(otp))) {
		// Incorrect OTP
		throw new CustomError("Incorrect OTP!", 400);
	}

	// set the user to verified.
	user.verified = true;
	user.otp = undefined;
	user.otpExpiryTime = undefined;

	// save the changed made to ths user document.
	const updatedUser = await user.save({
		validateModifiedOnly: true /* Runs validation only on modified fields */,
	});

	// if we reach here, it means user entered the correct OTP.
	// Now we have to generate JWT token and send a successfull response.
	const jwtToken = generateJwtToken({ userId: user._id });
	return res
		.status(201)
		.cookie("jwt", jwtToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000, // maxAge defines Cookie Lifespan before it expires. After 7 days (7 * 24 * 60 * 60 * 1000 in Milliseconds), the cookie is automatically deleted.
			httpOnly: true, // Prevents client-side JavaScript from accessing the cookie.
			sameSite: "strict", // cookies are only sent for same-site requests.
			secure: environmentVariables.NODE_ENV !== "development", // Ensures cookies are sent only over HTTPS.
		})
		.json({
			status: "success",
			message: "Email verified successfully!",
			user: updatedUser,
			token: jwtToken,
		});
});

// Resend OTP to the user's email address.
export const resendOTP = asyncHandler(async (req, res, next) => {
	const { email } = req.body;

	if (!email) {
		throw new CustomError("Email is required!");
	}

	// find the user using the email.
	const user = await UserModel.findOne({ email });

	// Check: If user exists or not.
	if (!user) {
		throw new CustomError("User not found! Signup Instead.", 400);
	}

	// Generate a 4-digit OTP using the otp-generator npm package.
	const otp = otpGenerator.generate(4, {
		lowerCaseAlphabets: false,
		specialChars: false,
		upperCaseAlphabets: false,
	});

	// store the otp in the user document.
	console.log(user);
	user.otp = otp;
	user.otpExpiryTime = Date.now() + 2 * 60 * 1000; // Once the OTP is generated, it will expire after 2 minutes.

	// save the changes.
	// this way of saving the documnet will trigger the pre save middleware and it will automatically hash the OTP before storing into the database.
	await user.save({
		validateModifiedOnly: true /* run validation on updated fields only. */,
	});

	// Send the OTP to the user's email address.
	const firstName =
		user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1);

	const lastName = user.lastname
		? user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1)
		: "";

	const userName = `${firstName} ${lastName}`.trim();
	const otpEmail = otpEmailTemplate({ userName, otp });
	await mailer({
		recipientEmail: user.email,
		subject: "Talks: OTP for verification",
		textMessage: `Your OTP for Talks is: ${otp}.`,
		htmlTemplate: otpEmail,
	});

	// if we reach here, it means OTP sent successfully.
	return res.status(200).json({
		status: "success",
		message: "OTP re-sent successfully!",
	});
});

// Login
export const login = asyncHandler(async (req, res, next) => {
	// take out email and password from the `req.body`.
	const { email, password } = req.body;

	// simple check: if any of the required fileds are missing.
	if (!email || !password) {
		throw new CustomError(
			"Some required fields are missing! Both email and password is required.",
			400
		);
	}

	// find the user document.
	const user = await UserModel.findOne({ email, verified: true }).select(
		"+password"
	);
	//  `.select("+password")` method in Mongoose is used to explicitly include a field that is excluded by default in the schema.

	if (!user) {
		// User doen't exists.
		throw new CustomError("User not found! Signup Instead.", 400);
	}

	// if we are able to find the user, check whether user entered the correct password or not.
	if (!(await user.isPasswordCorrect(password))) {
		// Incorrect Password
		throw new CustomError("Incorrect Password!", 400);
	}

	// If we reach here, it means Password is correct. Now, generate JWT token and send a successfull response.

	// we don't want to send the password field to the client.
	user.password = undefined; // we are not saving this change because saving the document will make the password field undefined in the database and we don't want that.

	const jwtToken = generateJwtToken({ userId: user._id });
	return res
		.status(200)
		.cookie("jwt", jwtToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000, // maxAge defines Cookie Lifespan before it expires. After 7 days (7 * 24 * 60 * 60 * 1000 in Milliseconds), the cookie is automatically deleted.
			httpOnly: true, // Prevents client-side JavaScript from accessing the cookie.
			sameSite: "strict", // cookies are only sent for same-site requests.
			secure: environmentVariables.NODE_ENV !== "development", // Ensures cookies are sent only over HTTPS.
		})
		.json({
			status: "success",
			message: "Logged In successfully!",
			user: user,
			token: jwtToken,
		});
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
	// Delete the JWT cookie on the client side.
	return res
		.status(200)
		.cookie("jwt", "", { maxAge: 0 })
		.json({ status: "success", message: "Logged Out successfully!" });
});

// isUserAuthenticated - is used to check whether user is authenticated or not.
export const isUserAuthenticated = asyncHandler(async (req, res, next) => {
	let token;

	// Take out the JWT Token, it can be present in cookies or in headers.
	if (req.cookies.jwt) {
		token = req.cookies.jwt;
	} else if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	// Simple Check: Whether token exists or not.
	if (!token) {
		throw new CustomError(
			"You are not logged in! Please log in to access the application.",
			401
		);
	}

	// Decode the JWT Token.
	const decoded = verifyJwtToken(token);

	// Check if the user still exists.
	const user = await UserModel.findById(decoded.userId).select("-password");

	// Simple Check: If user doesn't exists.
	if (!user) {
		throw new CustomError(
			"The user belonging to this token no longer exists. Log In Instead.",
			401
		);
	}

	// Check if token is still valid
	if (!(await user.isTokenValid(decoded.iat))) {
		throw new CustomError(
			"Invalid Token, The user may have recenlty changed their password.",
			401
		);
	}

	// If we reach her, it means token is valid and user still exists.
	req.user = user; // attach the user details to the request object.
	next(); // pass the flow to the next middleware.
});
