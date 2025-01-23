const http = require("http");
const app = require("./app");
const environmentVariables = require("./environmentVariables");
const connectDB = require("./database");


// PORT on which our server will run.
const PORT = environmentVariables.PORT;

// Creating server.
const server = http.createServer(app);

// Database Connection
connectDB(environmentVariables.MONGO_DB_URL);

// Start the server and listen for the incoming requests.
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} `);
});
