// Database connection code
const mongoose = require("mongoose");

// Always remember that establishing a database connection takes time so always use async/await.
async function connectDB(url) {
    try {
        await mongoose.connect(url);
        console.log("Database Successfully Connected");
    } catch (error) {
        console.error("Database connection failed!!", error);
    }
}

module.exports = connectDB;
