const userModel = require("../models/userModel");

const disconnectHandler = async (socket) => {
    // Log the disconnections.
    console.log(`User Disconnected: ${socket.id}`);

    // When the user is disconnected, update the user document set its socketId to undefined and update it status to offline.
    const user = await userModel.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: undefined, status: "OFFLINE" },
        {
            new: true, // this ensures that the new updated document gets returned.
            validateModifiedOnly: true, // run validations only on modified fields.
        }
    );

    if (user) {
        // Broadcast to everyone that this user is disconnected except the disconnected user.
        // `socket.broadcast.emit(event, data)` sends a message to all connected clients except the sender or disconnected user.
        socket.broadcast.emit("user-disconnected", {
            message: `User: ${user.name} is disconnected.`,
            userId: user._id,
            status: "OFFLINE",
        });
    } else {
        console.log(`User with Socket ID: "${socket.id} not found."`);
    }
};

module.exports = disconnectHandler;
