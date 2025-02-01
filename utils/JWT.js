const jsonWebToken = require("jsonwebtoken");
const environmentVariables = require("../environmentVariables");

class JWT {
    // Method to Sign JWT Token
    signToken(payload) {
        //  The sign() method in jsonwebtoken (JWT) can be used to generate a JWT token synchronously.
        const token = jsonWebToken.sign(
            payload,
            environmentVariables.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );
        return token;
    }

    // Method to verify JWT token.
    verifyToken(token) {
        if (!token) {
            throw new Error("JWT Token is not present!!");
        }

        //  The verify() method in jsonwebtoken (JWT) can be used to verify a JWT token synchronously.
        const decoded = jsonWebToken.verify(
            token,
            environmentVariables.JWT_SECRET_KEY
        );
        return decoded;
    }
}

module.exports = JWT;
