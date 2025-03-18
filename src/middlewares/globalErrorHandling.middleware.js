function globalErrorHandlingMiddleware(error, req, res, next) {
	error.statusCode = error.statusCode || 500;
	error.status = error.status || {
		src: "Global Error Handling Middleware",
		message: "Internal Server Error!",
	};

	return res.status(error.statusCode).json({
		status: error.status,
		message: error.message,
	});
}

export default globalErrorHandlingMiddleware;
