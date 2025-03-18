import environmentVariables from "../environmentVariables.js";
import jsonwebtoken from "jsonwebtoken";

export const generateJwtToken = function (payload) {
	return jsonwebtoken.sign(payload, environmentVariables.JWT_SECRET_KEY, {
		expiresIn: "7d", // JWt Token will expire in 7 days
	});
};
export const verifyJwtToken = function (token) {
	try {
		return jsonwebtoken.verify(token, environmentVariables.JWT_SECRET_KEY);
	} catch (error) {
		throw new Error("Token is either invalid or expired.");
	}
};
