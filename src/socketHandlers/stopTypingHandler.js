import UserModel from "../models/user.model.js";

async function stopTypingHandler(socket, data, io) {
	// `userId` is the id of the other user to whom we need to show the typing indicator.
	// `conversationId` is the id of the conversation on which logged-in user is typing or sending message.
	const { userId, conversationId } = data;

	// Fetch the user with id `userId`.
	const user = await UserModel.findById(userId).select("+socketId");

	// we only show the typing indicator when the user is online.
	if (user && user.status === "Online" && user.socketId) {
		const dataToSent = {
			conversationId,
			typing: false,
		};

		// `socket` represents the current user details, so if you want to emit an event to any other user, you cannot do this using the `socket` object. `socket` represents the current connected client, so it can only emit events to itself or broadcast to others.
		// That'y why I'm using Socket.io server instance `io`, using `to()` we can specify to which client we have to send the event.
		// `io.to(user.socketId)`: Targets a specific client by their socketId.
		io.to(user.socketId).emit("stopTyping", dataToSent);
	} else {
		// User is offline, don't emit any event.
		console.log(
			`User with ID ${user._id} is Offline. Not emitting typing status.`
		);
	}
}

export default stopTypingHandler;
