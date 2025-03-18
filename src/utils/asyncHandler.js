// `asyncHandler` is a wrapper function that wraps an asynchronous function and executes it. If the asynchronous function executes successfully without any errors, it simply returns the result. However, if the asynchronous function encounters an error during execution, `asyncHandler` automatically catches the error and passes it to the global error-handling middleware.

// This approach is commonly used to handle errors in asynchronous functions, reducing the need for explicit `try...catch` blocks in route handlers.
function asyncHandler(asyncFunction) {
	// it returns a middleware function.
	return (req, res, next) => {
		Promise.resolve(asyncFunction(req, res, next)).catch((error) =>
			next(error)
		);
	};
}

export default asyncHandler;
