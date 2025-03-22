import CustomError from "../utils/CustomError.js";
import { verifyJwtToken } from "../utils/Jwt.js";

function authSocketMiddleware(socket, next) {
	// get the JWT token.
	const token =
		socket.handshake.auth?.jwt ||
		socket.handshake.headers?.cookie?.match(/jwt=([^;]+)/)?.[1] ||
		null;

	try {
		const decoded = verifyJwtToken(token);
		socket.user = decoded; // decoded object contains the user id. so, attach it to the socket.
	} catch (error) {
		next(new CustomError("Unauthorized User", 401));
	}

	// if we reach here, it means user is authorized, call the next middleware.
	next();
}

export default authSocketMiddleware;
