import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		// List of participants/users involved in a comnversation.
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User", // Reference to User model.
				required: true,
			},
		],

		// List of all the messages in a conversation.
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Message", // Reference to Message Model
				required: true,
			},
		],

		// Stores the last message for preview.
		lastMessage: {
			type: String,
		},
	},
	{ timestamps: true }
);

// Model
const ConversationModel = mongoose.model("Conversation", conversationSchema);
export default ConversationModel;
