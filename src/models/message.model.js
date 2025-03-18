import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to User model
			required: true,
		},

		// Text Message
		content: {
			type: String,
			trim: true,
		},

		image: {
			type: String, // Cloudinary URL
		},

		giphyUrl: {
			type: String,
		},
	},
	{ timestamps: true }
);

// Model
const MessageModel = mongoose.model("Message", messageSchema);
export default MessageModel;
