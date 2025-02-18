const express = require("express");
const routes = require("./routes");

const cors = require("cors"); // cors package is used to configure CORS.

const expressMongoSanitize = require("express-mongo-sanitize"); // middleware used to sanitize or remove malicious data from the data that is sent by the user in the request body (req.body) or in query parameters (req.query) or dynamic path parameters (req.params).

const expressRateLimit = require("express-rate-limit"); // rate limiting middleware for Express. It is used to set how many API calls the user can make at a specified interval of time.

const helmet = require("helmet"); // middleware used to set various http headers to improve security.

const hpp = require("hpp"); // middleware used to protect express application from HTTP parameter pollution attacks.

const morgan = require("morgan"); // middleware used to log details about incoming HTTP requests - specially used fo debugging and monitoring purposes.

const cookieParser = require("cookie-parser"); // middleware used to parse cookies and populate `req.cookies` with an object keyed by cookie names.

// Defining configurations for express rate limiter.
const limiter = expressRateLimit({
    windowMs: 1 * 60 * 60 * 1000, // 1-hour in milliseconds
    max: 100, // maxmium 100 API request per `windowMs`
    message:
        "Too many requests from this IP address, please try again in an hour.",
});

const globalErrorHandlingMiddleware = require("./middlewares/globalErrorHandlingMiddleware"); // global error handling middleware.

// Initializing `app`.
const app = express();

// Setting up middlewares
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
        credentials: true,
    })
);

app.use(cookieParser());

app.use(express.json({ limit: "10kb" })); // used to parse the json data and populate the parsed json data to `req.body`.

app.use(express.urlencoded({ extended: true })); // used to parse form data and populate parsed json data to `req.body`. With extended option set to true, it cnan parse nested objects also like {preson: {name: John}}.

app.use(helmet());
app.use(morgan("dev"));
app.use(hpp());
app.use(expressMongoSanitize());

app.use("/api", limiter); // applying rate limiter to API's that start with `/api`.

// Routes
app.use(routes);

app.use(globalErrorHandlingMiddleware); // middlewares executes in all, If any middleware call the global error handling middleware, express will skip all the middleware in the middleware stack and directly move to the global error handling middleware.

module.exports = app;
