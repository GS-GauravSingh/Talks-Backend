const conversationModel = require("../models/conversationModel");
const messageModel = require("../models/messageModel");

const newMessageHandler = async (socket, data, io) => {
    console.log("Message Data: ", data);
    const { message, conversationId } = data;
    const { author, content, giphyUrl } = message;

    try {
        // Find the conversation using the `conversationID`.
        const conversation = await conversationModel.findById(conversationId);

        if (!conversation) {
            return socket.emit("error", { message: "Conversation not found." });
        }

        // Create a new message
        const newMessage = await messageModel.create({
            author,
            content,
            giphyUrl,
        });

        // Push the newMessage ID to the array of messages in the conversation.
        conversation.messages.push(newMessage._id);

        // Populate the conversation with messages and participants.
        const updatedConversation = await conversationModel
            .findById(conversationId)
            .populate("messages")
            .populate("participants");

        // Find the participants who are online.
        const onlineParticipants = updatedConversation.participants.filter(
            (participant) =>
                participant.status === "ONLINE" && participant.socketId
        );

        console.log(onlineParticipants);

        // Emit the new message back to the online participants.
        onlineParticipants.forEach((participant) => {
            console.log("Participant Socket Id: ", participant.socketId);
            io.to(participant.socketId).emit("new-direct-chat", {
                conversationId,
                message: newMessage,
            });
        });
    } catch (error) {
        console.log("Error: newMessageHandler: ", error);
        socket.emit("error", { message: "Failed to send message." });
    }
};

module.exports = newMessageHandler;
