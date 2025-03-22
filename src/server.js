import environmentVariables from "./environmentVariables.js";
import connectMongoDB from "./database/database.js";
import { server } from "./scoketServer.js";

// PORT on which our server will run.
const PORT = environmentVariables.PORT;

// Database Connection
connectMongoDB(process.env.MONGODB_URL);

// Start the server and listen for incoming requests.
server.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}`);
});
