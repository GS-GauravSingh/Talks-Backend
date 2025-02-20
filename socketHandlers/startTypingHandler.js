const userModel = require("../models/userModel");

const startTypingHandler = async (socket, data, io) => {
    // `userId` is the Id of the user involved in the conversation who is going to receive the message.
    // `conversationId` is the conversation in which typing is happening.
    const { userId, conversationId } = data;

    // Finds the recipient user in the database using userId. This is needed to check the user's status and get their socket ID.
    const user = await userModel.findById(userId);

    if (user && user.status === "ONLINE" && user.socketId) {
        const dataToSend = {
            conversationId,
            typing: true,
        };

        // `to(roomOrSocketId).emit(event, data)` is used to send an event to a specific socket or a room instead of broadcasting it to all clients.
        // `io.to(user.socketId).emit()` sends an event only to the recipient user (not everyone). "start-typing" event informs the recipient that someone is typing in their conversation
        io.to(user.socketId).emit("start-typing", dataToSend);
    } else {
        // Recipient User is OFFLINE.
        console.log(
            `User with ID: ${userId} is offline. Not emitting typing status.`
        );
    }
};

module.exports = startTypingHandler;
