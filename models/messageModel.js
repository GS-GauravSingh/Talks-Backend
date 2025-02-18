const mongoose = require("mongoose");

// Creating a Message Schema.
const messageSchema = new mongoose.Schema(
    {
        // author is the person who is sending the message to other user.
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        content: {
            type: String,
            trim: true,
        },

        giphyUrl: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Creating a model using Message Schema.
const messageModel = mongoose.model("Message", messageSchema);

// Export the message model.
module.exports = messageModel;
