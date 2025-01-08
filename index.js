const http = require("http");
const app = require("./app");
const environmentVariables = require("./environmentVariables");


// PORT on which our server will run.
const PORT = environmentVariables.PORT;

// Creating server.
const server = http.createServer(app);

// Start the server and listen for the incoming requests.
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} `);
});
