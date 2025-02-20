const { Server } = require("socket.io"); // Imports the `Server` class from the socket.io package, which allows us to create a WebSocket server.
const verifySocketToken = require("./middlewares/authSocketMiddleware");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const startTypingHandler = require("./socketHandlers/startTypingHandler");
const stopTypingHandler = require("./socketHandlers/stopTypingHandler");
const getChatHistoryHandler = require("./socketHandlers/getChatHistoryHandler");
const newMessageHandler = require("./socketHandlers/newMessageHandler");

// Setting up a WebSocket Server using `Socket.io` to enable real-time communication between the client and the server.
// This `registerSocketServer()` function takes an HTTP server (httpServer) as an argument.
const registerSocketServer = (httpServer) => {
    // Creating a Socket.io Server Instance

    // 1st Argument: When we pass the HTTP server (httpServer) while creating a new instance of Server from socket.io, it allows us to integrate WebSockets with the existing HTTP server. This way the same server can handle both HTTP requests (REST APIs) and WebSocket connections.

    // 2nd Argument: The second parameter in the Server constructor is an options object that allows you to configure various settings for the Socket.io server.
    const io = new Server(httpServer, {
        // There are various options but right now we are configuring only the CORS for the socket server.
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // `io.use()` is used to add middleware on the Socket.io server, similar to how `app.use()` works in Express.js.
    // Once a WebSocket connection is established, we refer to the connected client as a "socket". The server assigns a unique ID to each socket (socket.id), which helps identify individual clients. A `Socket` is the fundamental class for interacting with the client. `socket` is an instance of the `Socket` class, and it's provided to you so that you can client properties (like socket.id) and events (for sending and receiving messages).
    // next: is used to call the next middleware.
    io.use((socket, next) => {
        // socket represent the individual connected client.
        // next: used to call the next middleware function.

        // `verifySocketToken` is a middleware function used to check whether the client is authorized or not.
        verifySocketToken(socket, next);
    });

    // Starts listening for Web Sockets Connections.
    // `io.on("connection", callback)` is an event listener that listens for new WebSocket connections, Here, "connection" is an event provided by Socket.io that is triggered whenever a new client (socket) connects to the server. Besides built-in events like "connection" and "disconnect", you can define your own custom events.

    // Whenever a new client connects, the callback function is executed. The `socket` parameter represents the connected client (a unique WebSocket instance).

    // `on()` method is used to add an event listener in Socket.io.
    io.on("connection", (socket) => {
        console.log("User Connected");
        console.log("User Socket ID: ", socket.id);

        // New Connection Handler
        newConnectionHandler(socket, io);

        // Disconnect Handler - When user disconnects from the socket server.
        socket.on("disconnect", () => {
            disconnectHandler(socket);
        });

        // New Message Handler - When client sends a new message
        socket.on("new-message", (data) => {
            newMessageHandler(socket, data, io);
        });

        // Chat History Handler
        socket.on("get-chat-history", (data) => {
            getChatHistoryHandler(socket, data);
        });

        // Start Typing Handler
        socket.on("start-typing", (data) => {
            startTypingHandler(socket, data, io);
        });

        // Stop Typing Handler
        socket.on("stop-typing", (data) => {
            stopTypingHandler(socket, data, io);
        });
    });
};

module.exports = { registerSocketServer };
