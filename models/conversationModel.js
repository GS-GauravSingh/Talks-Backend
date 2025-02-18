const mongoose = require("mongoose");

// Creating a Conversation Schema.
const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
    },
    { timestamps: true }
);

// Creating a model using Conversation Schema.
const conversationModel = mongoose.model("Conversation", conversationSchema);

// Export the conversation model.
module.exports = conversationModel;
