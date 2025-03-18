import ConversationModel from "../models/conversation.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Start Conversation - Starts a new conversation between two users. If there is already an existing conversation between them, then it return that exisiting conversation.
export const startConversation = asyncHandler(async function (req, res, next) {
	// Take out the logged in user id from request object.
	const loggedInUserId = req.user._id;

	// Take out the user Id to whom we have to start a conversation.
	const { userId } = req.body;

	// Now we have to ID of both the user's. Now, we have to create a conversation between these two users.
	// But before that just check whether is there any conversation already exists between these two users.
	let existingConversation = await ConversationModel.findOne({
		participants: {
			$all: [
				loggedInUserId,
				userId,
			] /* $all -> Matches [A, B] and [B, A], ensures both the users are present in the participants array. */,
		},
	})
		.populate("messages")
		.populate("participants");

	// If conversation already exisits between them.
	if (existingConversation) {
		return res.status(200).json({
			status: "success",
			message: "Conversation already exists!",
			conversation: existingConversation,
		});
	} else {
		// if conversation doesn't exists. Then create a new conversation between them.
		let newConversation = await ConversationModel.create({
			participants: [loggedInUserId, userId],
		});

		// you cannot use `populate()` method on `create()` method.
		newConversation = await ConversationModel.findById(newConversation._id)
			.populate("messages")
			.populate("participants");

		return res.status(201).json({
			status: "success",
			message: "New conversation created!",
			conversation: newConversation,
		});
	}
});

// Get Conversations - Return the list of user(s) to whom the currently logged-in user had some conversation before.
export const getConversation = asyncHandler(async function (req, res, next) {
	// Take out the logged in user id from request object.
	const loggedInUserId = req.user._id;

	// Find all the conversation in which current logged-in user is involved.
	const conversations = await ConversationModel.find({
		participants: {
			$in: [
				loggedInUserId,
			] /* $in: [loggedInUserId] → Checks if `loggedInUserId` exists in the participants array. */,
		},
	})
		.populate("messages")
		.populate("participants");

	// send the list of conversation as a response.
	return res.status(200).json({
		status: "success",
		message: "Conversation(s) fetched successfully!",
        conversations
	});
});
