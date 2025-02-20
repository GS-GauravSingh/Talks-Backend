const JWT = require("../utils/JWT");

// Function to verify JWT Token.
function verifySocketToken(socket, next) {
    // get the jwt token
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("NOT_AUTHORIZED")); // Reject connection if no token is provided
    }

    try {
        const jwt = new JWT();
        const decoded = jwt.verifyToken(token);
        socket.user = decoded; // Attach user data to the socket instance
        next(); // Proceed to the next middleware or event handlers
    } catch (error) {
        const socketError = new Error("NOT_AUTHORIZED");
        return next(socketError); // calls the global error handling middleware.
    }
}

module.exports = verifySocketToken;
