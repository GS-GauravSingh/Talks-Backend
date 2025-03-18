import UserModel from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../utils/cloudinary.js";
import CustomError from "../utils/CustomError.js";

// Get Me - Get the logged In user details.
export const getMe = asyncHandler(async function (req, res, next) {
	// Take out the user details for the request object.
	const { user } = req;

	// Send the user details to the client.
	return res.status(200).json({
		status: "success",
		message: "User info. found successfully!",
		user,
	});
});

// Update Me - Update the Logged In user details.
export const updateMe = asyncHandler(async function (req, res, next) {
	const { firstname, lastname, jobTitle, bio, country } = req.body;

	// Take out the logged in user id from request object.
	const loggedInUserId = req.user._id;

	// Update the details
	const updatedUser = await UserModel.findByIdAndUpdate(
		loggedInUserId,
		{
			firstname,
			lastname,
			jobTitle,
			bio,
			country,
		},
		{
			new: true,
			validateModifiedOnly: true /* run validation on modified fields only */,
		}
	);

	// send a successfull response
	return res.status(200).json({
		status: "success",
		message: "User info. updated successfully!",
		data: {
			updatedUser,
		},
	});
});

// Update Avatar
export const updateAvatar = asyncHandler(async function (req, res, next) {
	const { avatar } = req.body;

	if (!avatar) {
		throw new CustomError("Avatar is required!", 400);
	}

	// Take out the logged in user id from request object.
	const loggedInUserId = req.user._id;

	// upload the file in the cloud storage i.e., Cloudinary.
	const cloudinaryResponse = await cloudinary.uploader.upload(avatar);

	// update the user detail in the MongoDB database.
	const updatedUser = await UserModel.findByIdAndUpdate(
		loggedInUserId,
		{
			avatar: cloudinaryResponse.secure_url /* secure_url is the secure HTTPS URL of the uploaded image or file. */,
		},
		{
			new: true,
			validateModifiedOnly: true /* run validation on modified fields only */,
		}
	);

	// send a successfull response
	return res.status(200).json({
		status: "success",
		message: "User info. updated successfully!",
		data: {
			updatedUser,
		},
	});
});

// Update Password
export const updatePassword = asyncHandler(async function (req, res, next) {
	const { currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		throw new CustomError(
			"Some required fields are missing! Both current password and new password is required.",
			400
		);
	}

	// Take out the logged in user id from request object.
	const loggedInUserId = req.user._id;
	const user = await UserModel.findById(loggedInUserId);

	// Check whether the `currentPassword` matches the password present in the user document.
	if (!(await user.isPasswordCorrect(currentPassword))) {
		throw new CustomError(
			"Incorrect Current Password! Please provide the correct password.",
			400
		);
	}

	// If we reach here, it means user entered the correct current password.
	// Update the password.
	user.password = newPassword;
	user.passwordChangedAt = Date.now();

	// save the changes.
	await user.save({ validateModifiedOnly: true });

	return res.status(200).json({
		status: "success",
		message: "Password updated successfully!",
	});
});

// Get Users - Returns a list of all the verified users except the current logged in user.
export const getUsers = asyncHandler(async function (req, res, next) {
	// Take out the logged in user id from request object.
	const loggedInUserId = req.user._id;

	// take out all the other verified user.
	const otherVerifiedUsers = await UserModel.find({
		_id: { $ne: loggedInUserId },
		verified: true,
	}).select("firstname lastname avatar _id status");

	return res.status(200).json({
		status: "success",
		message: "User(s) found successfully!",
		users: otherVerifiedUsers,
	});
});
