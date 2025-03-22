import app from "./app.js";
import http from "http";
import environmentVariables from "./environmentVariables.js";
import { Server } from "socket.io";
import authSocketMiddleware from "./middlewares/authSocket.middleware.js";
import newConnectionHandler from "./socketHandlers/newConnectionHandler.js";
import disconnectHandler from "./socketHandlers/disconnectHandler.js";
import startTypingHandler from "./socketHandlers/startTypingHandler.js";
import stopTypingHandler from "./socketHandlers/stopTypingHandler.js";
import getOnlineUsersHandler from "./socketHandlers/getOnlineUsersHandler.js";

// Create a Server using the HTTP module, express is built on top of HTTP module.
const server = http.createServer(app);

// `io` stands for input/output, here we are initializing a new socket server, also it attaches the existing HTTP server with the socket server so that socket server will work along with existing HTTP server. This allows real-time communication using WebSockets alongside regular HTTP requests on the same existing HTTP server.
const io = new Server(server, {
	cors: {
		origin: environmentVariables.FRONTEND_URL,
		methods: ["GET", "POST"],
		credentials: true /* allow cookies */,
	},
});

// Socket.io allows us to add middleware, just like Express.
// Here, I'm adding a middleware just to check whether a user is authenticated or not.
io.use((socket, next) => {
	// socket: In web sockets, we refer client as a socket, and this socket represents the individual client connection. It's an object that contains details about the client like `socket.id` (it a unique id assigned to each new connection) and other details.

	// next: is used to call next middleware.

	authSocketMiddleware(socket, next); // method used to check whether user is authenticated or not.
});

// if we reach at this point, it means client is authenticated. Now establish a new connection.
const onlineUsers = {}; // global object to store online users.

// `.on()` is used to listen for incoming events.
// Here, the event is `"connection"`, which means a new client is connecting.
// When a client connects, `.on("connection")` receives the `socket` object in the callback.
// The `socket` object represents the connected client and contains details like `socket.id`.
io.on("connection", (socket) => {
	console.log(`A new user is connected with socket id: ${socket.id}`);

	// Once a new client/user/socket is connected,
	// we can define multiple socket event handlers here to handle various events.

	// New Connection Handler - When a new connection happens.
	newConnectionHandler(socket, io, onlineUsers);

	// Disconnect Handler - Whenever someone disconnect from the server.

	// `connection` and `disconnect` are standard built-in events in Socket.IO.
	// They fire automatically when:
	// A new client connects → "connection" event triggers.
	// A client disconnects (e.g., closes tab, loses internet, or leaves) → "disconnect" event triggers.

	// Listening for the "disconnect" event (fires automatically when a user disconnects)
	socket.on("disconnect", () => {
		disconnectHandler(socket, io, onlineUsers);
	});

	// Start Typing Handler
	socket.on("startTyping", (data) => {
		startTypingHandler(socket, data, io);
	});

	// Stop Typing Handler
	socket.on("stopTyping", (data) => {
		stopTypingHandler(socket, data, io);
	});
});

setInterval(() => {
	// emit online users
	getOnlineUsersHandler(io, onlineUsers);
}, [1000 * 8]);

export { io, server };
