import { Server } from "socket.io";
import authSocketMiddleware from "./middlewares/authSocket.middleware.js";
import newConnectionHandler from "./socketHandlers/newConnectionHandler.js";
import disconnectHandler from "./socketHandlers/disconnectHandler.js";
import startTypingHandler from "./socketHandlers/startTypingHandler.js";
import stopTypingHandler from "./socketHandlers/stopTypingHandler.js";
import getMessageHistoryHandler from "./socketHandlers/getMessageHistoryHandler.js";
import newMessageHandler from "./socketHandlers/newMessageHandler.js";
import getOnlineUsersHandler from "./socketHandlers/getOnlineUsersHandler.js";

/*
For basic CRUD operations, we can use Express.js, but if real-time communication is required, we need to use WebSockets. Express is ideal for handling standard HTTP requests like creating, reading, updating, and deleting data. However, for features like live chat, notifications, or real-time updates, WebSockets enable persistent, bidirectional communication between the client and server. 

Socket.io is a library that enables bidirectional and event-based communication between a client and a server. 

Event-based means that both the client and server can listen for events and both the client and the server can emit events, where emit means sending an event. Both the client and the server continuously listen for events, it is not like the client continuously polls (poll means sending HTTP request to the server to fetch the latest data) the server or vice versa. It is event-based; the client and server only respond when any particular event is emitted. This ensures efficient, real-time communication without unnecessary network requests. 
*/

// The following function used to setup the socket server for our application, it accespts on argument i.e., `httpServer`.
// `httpServer` is the server instance we have created using the built-in `http` module.
function registerSocketServer(httpServer) {
	// `io` stands for input/output, here we are initializing a new socket server, also it attaches the existing HTTP server with the socket server so that socket server will work along with existing HTTP server. This allows real-time communication using WebSockets alongside regular HTTP requests on the same existing HTTP server.
	const io = new Server(httpServer, {
		cors: {
			origin: "http://localhost:5173",
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

		// New Message Handler
		socket.on("newMessage", (data) => {
			newMessageHandler(socket, data, io, onlineUsers);
		});

		// Chat History Handler - Retrieves chat history
		socket.on("chatHistory", (data) => {
			getMessageHistoryHandler(socket, data);
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
}

export default registerSocketServer;
