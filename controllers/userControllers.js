const asyncHandler = require("../utils/asyncHandler").asyncHandlerPromise;
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/userModel");
const conversationModel = require("../models/conversationModel");

// Get Me
const getMe = asyncHandler(async (req, res, next) => {
    const { user } = req;

    const apiResponse = new ApiResponse(
        200,
        "Success",
        user,
        `User info found successfully!`
    );

    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
        data: {
            user: apiResponse.data,
        },
    });
});

// Update Me
const updateMe = asyncHandler(async (req, res, next) => {
    const { name, jobTitle, bio, country } = req.body;
    const { user } = req;
    const userId = user._id;

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        {
            name: name,
            jobTitle: jobTitle,
            bio: bio,
            country: country,
        },
        {
            new: true, // this ensures that the new updated document gets returned.
            validateModifiedOnly: true, // run validations only on modified fields.
        }
    );

    const apiResponse = new ApiResponse(
        200,
        "Success",
        updatedUser,
        `Profile info updated successfully!`
    );

    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
        data: {
            user: apiResponse.data,
        },
    });
});

// Update Avatar
const updateAvatar = asyncHandler(async (req, res, next) => {
    const { avatar } = req.body;
    const { user } = req;
    const userId = user._id;

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        {
            avatar,
        },
        {
            new: true, // this ensures that the new updated document gets returned.
            validateModifiedOnly: true, // run validations only on modified fields.
        }
    );

    const apiResponse = new ApiResponse(
        200,
        "Success",
        updatedUser,
        `Avatar updated successfully!`
    );

    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
        data: {
            user: apiResponse.data,
        },
    });
});

// Update Password
const updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    const user = userModel.findById(_id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
        // Incorrect Password
        const apiError = new ApiError(400, `Current Password Is Incorrect!`);
        return next(apiError);
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();

    // save the document.
    await user.save({});

    const apiResponse = new ApiResponse(
        200,
        "Success",
        null,
        `Password updated successfully!`
    );

    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
    });
});

// Get all the verified users
const getUsers = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;

    // fetch all the verified user(s) except the current (logged in) user.
    const otherVerifiedUsers = await userModel
        .find({
            _id: { $ne: _id },
            verified: true,
        })
        .select("name avatar _id status");

    const apiResponse = new ApiResponse(
        200,
        "Success",
        otherVerifiedUsers,
        `User(s) fetched successfully!`
    );

    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
        data: {
            users: apiResponse.data,
        },
    });
});

// Start Conversation
const startConversation = asyncHandler(async (req, res, next) => {
    const { _id } = req.user; // id of the current logged in user.
    const { userId } = req.body; // id of the user to whom the current logged in user wants to start a conversation with.

    // check whether there is an existing conversation between them exists or not.
    let conversation = await conversationModel
        .findOne({
            participants: {
                $all: [userId, _id],
            },
        })
        .populate("messages")
        .populate("participants");

    if (conversation) {
        // conversation exists.
        const apiResponse = new ApiResponse(
            200,
            "Success",
            conversation,
            `Conversation already exists!`
        );

        return res.status(apiResponse.statusCode).json({
            status: apiResponse.status,
            message: apiResponse.message,
            data: {
                users: apiResponse.data,
            },
        });
    } else {
        // no previous conversation exists, we have to create a conversation.
        let newConversation = await conversationModel.create({
            participants: [userId, _id],
        });

        // we cannot use `populate()` method on `create()` method.
        newConversation = await conversationModel
            .findById(newConversation._id)
            .populate("messages")
            .populate("participants");

        const apiResponse = new ApiResponse(
            200,
            "Success",
            newConversation,
            `Conversation created!`
        );

        return res.status(apiResponse.statusCode).json({
            status: apiResponse.status,
            message: apiResponse.message,
            data: {
                users: apiResponse.data,
            },
        });
    }
});

// Get Conversations - used to fetch the list of user(s) to whom the currently logged-in user is talking.
const getConversations = asyncHandler(async (req, res, next) => {
    const { _id } = req.user; // id of the current logged in user.

    // Find all conversations where the currently logged-in user is a participant.
    const conversations = await conversationModel
        .find({
            participants: { $in: [_id] },
        })
        .populate("messages")
        .populate("participants");

    // sending the list of conversations as a response.
    const apiResponse = new ApiResponse(
        200,
        "Success",
        conversations,
        `Conversation(s) fetched successfully!`
    );

    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
        data: {
            users: apiResponse.data,
        },
    });
});

module.exports = {
    getMe,
    updateMe,
    updateAvatar,
    updatePassword,
    getUsers,
    startConversation,
    getConversations,
};
