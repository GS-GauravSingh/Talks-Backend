class CustomError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status =
			statusCode >= 400 && statusCode < 500
				? "Client Error"
				: "Internal Server Error";
		Error.captureStackTrace(this, this.constructor);
	}
}

export default CustomError;
