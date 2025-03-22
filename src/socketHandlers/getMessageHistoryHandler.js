import ConversationModel from "../models/conversation.model.js";

async function getMessageHistoryHandler(socket, data) {
	try {
		// `conversationId`
		const { conversationId } = data;
		console.log("Conversation Id: ", data);

		// Find the conversation using the conversationId.
		const conversation = ConversationModel.findById(conversationId)
			.select("messages")
			.populate("messages");

		if (!conversation) {
			socket.emit("error", {
				message: "Conversation not found",
			});
		}

		// Prepare the response data
		const responseData = {
			conversationId,
			history: conversation.messages,
		};

		// Emit the message history back to the same socket.
		socket.emit("chatHistory", responseData);
	} catch (error) {
		socket.emit("error", {
			message: "Failed to fetch message history",
			error,
		});
	}
}

export default getMessageHistoryHandler;
