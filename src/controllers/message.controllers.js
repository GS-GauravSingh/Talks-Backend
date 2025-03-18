import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../utils/cloudinary.js";

// Send Message
export const sendMessage = asyncHandler(async function (req, res, next) {
	// Take out the logged in user id from request object.
	const senderId = req.user._id;

	// Take out the id of the user to whom we have to send a message.
	// Also the message we need to send.
	const { userId, content, image, giphyUrl } = req.body;
	const receiverId = userId;

	let imageUrl;
	if (image) {
		// Upload image to cloudinary.
		const cloudinaryResponse = await cloudinary.uploader.upload(image);
		imageUrl = cloudinaryResponse.secure_url;
	}

	// find the conversation between them.
	// user are allowed to send message only when conversation is created - flow of our application.
	const conversation = await ConversationModel.findOne({
		participants: { $all: [senderId, receiverId] },
	});

	// OPTIONAL: If no conversation exists, return an error
	if (!conversation) {
		return res.status(400).json({
			status: "fail",
			message: "Conversation not found. Start a conversation first.",
		});
	}

	// Create a new message
	const newMessage = await MessageModel.create({
		author: senderId,
		content,
		image: imageUrl,
		giphyUrl,
	});

	// add this newly created message to conversation.
	conversation.messages.push(newMessage);
	conversation.lastMessage =
		content || (image ? "[Image]" : giphyUrl ? "[GIF]" : "");

	// save the changes made to conversations.
	await conversation.save({ validateModifiedOnly: true });

	// TODO: realtime functionality goes here => socket.io.

	return res.status(201).json({
		status: "success",
		message: "New message created and sent successfully!",
		newMessage,
	});
});
