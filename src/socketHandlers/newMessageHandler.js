import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";

async function newMessageHandler(socket, data, io) {
	console.log("New Message: ", data);

	const {
		message: { author, content, image, giphyUrl },
		receiverId,
	} = data;

	// take out the currently logged-in user id from socket object.
	const { userId } = socket?.user;

	try {
		// 1. Find the conversation in which currently logged-in user and the user to whom we have to send a message `receiverId` involved.
		const conversation = await ConversationModel.findOne({
			participants: { $all: [receiverId, userId] },
		})
			.populate("messages")
			.populate("participants");

		if (!conversation) {
			// if conversation doesn't exists.
			socket.emit("error", {
				message: "Conversation between them doesn't exists",
			});
		}

		// If user sends an image (image contains a base 64 url representing image data)
		let imageUrl;
		if (image) {
			// Upload image to cloudinary
			const cloudinaryResponse = await cloudinary.uploader.upload(image);
			imageUrl = cloudinaryResponse.secure_url;
		}

		// 2. Create a message
		const newMessage = await MessageModel.create({
			author,
			content,
			image: imageUrl,
			giphyUrl,
		});

		// 3. Push the new message in the conversation.
		conversation.messages.push(newMessage._id);

		// 4. save the changes made to the conversation
		await conversation.save({});

		// 5. Emit the message to the receiver, only if the user is online.
		// If the receiver is offline, the message is already stored in the database.
		const receiverSocketId = onlineUsers[receiverId];
		io.to(receiverSocketId).emit("newMessage", {
			newMessage,
		});
	} catch (error) {
		console.error("Error: newMessageHandler: ", error);
		socket.emit("error", {
			message: "Failed to send message",
		});
	}
}

export default newMessageHandler;
