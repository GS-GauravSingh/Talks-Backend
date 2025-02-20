const conversationModel = require("../models/conversationModel");

const getChatHistoryHandler = async (socket, data) => {
    try {
        // Conversation ID
        const { conversationId } = data;
        console.log("Conversation ID: ", data);

        // Find the conversation by `conversationId` and populate the messages.
        const conversation = await conversationModel
            .findById(conversationId)
            .select("messages")
            .populate("messages");

        if (!conversation) {
            return socket.emit("error", { message: "Conversation not found." });
        }

        const responseData = {
            conversationId,
            history: conversation.messages,
        };

        // Emit the chat history back to the same socket.
        socket.emit("chat-history", responseData);
    } catch (error) {
        // Handle any errors and sends error event back to th client.
        socket.emit("error", {
            message: "Failed to fetch chat history",
            error: error,
        });
    }
};

module.exports = getChatHistoryHandler;
