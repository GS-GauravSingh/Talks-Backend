const userModel = require("../models/userModel");

const newConnectionHandler = async (socket, io) => {
    const { userId } = socket.user;

    // Log when a new user gets connected.
    console.log(`User Connected: ${socket.id}`);

    // Add socketId to the user document and update its status to online.
    const user = await userModel.findByIdAndUpdate(
        userId,
        {
            socketId: socket.id,
            status: "ONLINE",
        },
        {
            new: true, // this ensures that the new updated document gets returned.
            validateModifiedOnly: true, // run validations only on modified fields.
        }
    );

    if (user) {
        // Broadcast to everyone that the new user is connected.
        // `socket.broadcast.emit(event, data)` sends a message to all connected clients except the sender.
        socket.broadcast.emit("user-connected", {
            message: `User: ${user.name} is connected.`,
            userId: user._id,
            status: "ONLINE",
        });
    } else {
        console.log(`User with ID: "${userId} not found."`);
    }
};

module.exports = newConnectionHandler;
