import UserModel from "../models/user.model.js";

async function disconnectHandler(socket, io, onlineUsers) {
	// `io` is the socket.io server instance.
	// `socket` represent an individual connected client.

	console.log(`User with socket id: ${socket.id} was disconnected`);

	// Update the user document, set socketId to undefined and updte the status to offline.
	const user = await UserModel.findOneAndUpdate(
		{ socketId: socket.id },
		{
			socketId: undefined,
			status: "Offline",
		},
		{
			new: true /* return the updated document (by defualt it returns the document it was before update) */,
			validateModifiedOnly: true /* run validation on updated fields only */,
		}
	);

	if (user) {
		delete onlineUsers[user._id]; // delete the user id for online users object.


		// Broadcast to everyone that the user is disconnected.

		// `broadcast` is used to send an event to all connected clients except the sender.
		// `emit` is used to send an event to a specific client or group of clients.
		socket.broadcast.emit("userDisconnected", {
			message: `User ${user.firstname} ${user.lastname} was disconnected.`,
			userId: user._id,
			status: "Offline",
		});
	} else {
		console.log(`User with Socket ID ${socket.id} not found.`);
	}
}

export default disconnectHandler;
