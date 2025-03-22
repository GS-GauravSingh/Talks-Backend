import express from "express";
import appRoutes from "./routes/index.js";

// Global Error Handling Middleware
import globalErrorHandlingMiddleware from "./middlewares/globalErrorHandling.middleware.js";

// is a middleware that helps prevent NoSQL injection attacks by removing potentially malicious keys (like $ and .) from user-supplied data in req.body, req.query, and req.params.
import mongoSanitize from "express-mongo-sanitize";

// `express-rate-limit` is a middleware used to limit repeated requests from the same IP address to prevent DoS (Denial of Service) attacks.
import { rateLimit } from "express-rate-limit";

// hpp stands for HTTP Parameter Pollution.
// It is a middleware that prevents attackers from sending duplicate query parameters that could manipulate your app's logic.
// Example of duplicate query parameters: /search?category=books&category=electronics
// This is called an HTTP Parameter Pollution attack, and this package helps prevent it.
import hpp from "hpp";

// `cookie-parser` is a middleware that parses cookies attached to client requests (req.cookies).
// It allows easy access to cookies without manually parsing req.headers.cookie.
import cookieParser from "cookie-parser";

// `CORS` is a middleware used to configure the CORS options for express application.
import cors from "cors";
import morgan from "morgan";
import environmentVariables from "./environmentVariables.js";

// -------------- Initializing express `app`. -------------------
const app = express();

// -------------- Setting Up Middlewares --------------------
app.use(
	cors({
		origin: environmentVariables.FRONTEND_URL,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true, // Allows sending cookies from backend to frontend
	})
);
app.use(express.urlencoded({ extended: true })); // Middleware used to parse form data (accessible through req.body)
app.use(express.json()); // Middleware used to parse json data (accessible through req.body)
app.use(cookieParser()); // Middleware used to parse cookies (accessible through req.cookies).
app.use(mongoSanitize()); // Middleware to sanitize user-supplied data in req.body, req.query, and req.params.
app.use(hpp()); // Middleware used to prevent HTTP Parameter Pollution attack.
app.use(morgan("dev"));

// API Limiter
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes in milliseconds
	max: 100, // Limit each IP to 100 requests per `windowMs`
	message: "Too many requests from this IP, please try again later.",
});

// ------------ Routes -----------------
app.get("/", (req, res) => {
	return res.send("<h2>Hello from server!</h2>");
});
app.use("/api/v1", appRoutes);

// Global Error Handling Middleware - Place it here after placing all other middlewares and routes.
// because when you call `Global Error Handling Middleware` express will skip all other middlewares present in the middleware stack and directly executes the `Global Error Handling Middleware`. So it has to present at the end of all the middlewares.
app.use(globalErrorHandlingMiddleware);

export default app;
