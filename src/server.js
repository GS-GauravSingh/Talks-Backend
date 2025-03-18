import app from "./app.js";
import http from "http";
import environmentVariables from "./environmentVariables.js";
import connectMongoDB from "./database/database.js";

// Create a Server using the HTTP module, express is built on top of HTTP module.
const server = http.createServer(app);

// PORT on which our server will run.
const PORT = environmentVariables.PORT;

// Database Connection
connectMongoDB(process.env.MONGODB_URL);

// Start the server and listen for incoming requests.
server.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}`);
});
