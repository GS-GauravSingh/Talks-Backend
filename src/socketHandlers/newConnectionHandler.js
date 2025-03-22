import UserModel from "../models/user.model.js";

async function newConnectionHandler(socket, io, onlineUsers) {
	// `io` is the socket.io server instance.
	// `socket` represent an individual connected client.

	// take out the logged in user id from socket object.
	const { userId } = socket?.user;

	console.log(`User with socket id ${socket.id} connected.`);

	// store the socket id to the user record and updates its status to online.
	const user = await UserModel.findByIdAndUpdate(
		userId,
		{
			socketId: socket.id,
			status: "Online",
		},
		{
			new: true /* return the updated document (by defualt it returns the document it was before update) */,
			validateModifiedOnly: true /* run validation on updated fields only */,
		}
	);

	if (user) {
		onlineUsers[user._id] = socket.id; // add the user id to online users object.

		// Broadcast to everyone that the new user is connected.

		// `broadcast` is used to send an event to all connected clients except the sender.
		// `emit` is used to send an event to a specific client or group of clients.
		socket.broadcast.emit("userConnected", {
			message: `User ${user.firstname} ${user.lastname} has connected.`,
			userId: user._id,
			status: "Online",
		});
	} else {
		console.log(`User with ID ${userId} not found.`);
	}
}

export default newConnectionHandler;
