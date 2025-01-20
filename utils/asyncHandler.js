// `asyncHandler` is a utility used to handle asynchronous route controllers/handlers in Express.js.
// If an error occurs in an asynchronous function, `asyncHandler` ensures that the error is caught and automatically forwarded to the global error-handling middleware.

// While you could use try-catch blocks to handle errors manually, `asyncHandler` is a more efficient and widely used approach. It simplifies the code by removing repetitive try-catch blocks, improving readability and maintainability.

// To use it, simply pass your asynchronous function to the `asyncHandler` utility. It will wrap the function, ensuring that any unhandled errors are properly caught and forwarded.

// `asyncHandler` is just a wrapper for your asynchronous function. It ensures that any errors occurring within the asynchronous function are caught and passed to the global error-handling middleware in Express, so you don't have to write repetitive try-catch blocks.

// 1st Approach: Implementing `asyncHanlder` using async/await.
// `asyncHandler` is a higher order function, it means it can accept one or more function(s) as an argument and also returns as function.
const asyncHandlerAsyncAwait = (asyncRequestHandlerFunc) => {
    // Creating a middleware function so that we can get access to the `req`, `res`, `next`, and `err`.
    return async (res, res, next) => {
        // Adding a try-catch block to handle error(s) because this is just a wrapper.
        try {
            // Execute the provided asynchronous function (asyncRequestHandlerFunc) with the Express request, response, and next parameters
            await asyncRequestHandlerFunc(req, res, next);
        } catch (error) {
            // If an error occurs during execution, handle it by sending an error response.
            // In this case we are direclty sending the response to the user. So, there is no need to pass erorr to global error handling middleware. But if you want, then you can, Forward the error to the global error-handling middleware using: `next(error);`.
            res.status(error.code || 500).json({
                success: false,
                message: error.message,
            });
        }
    };
};

// 2nd Approach: Implementing `asyncHanlder` using Promise.
const asyncHandlerPromise = (asyncRequestHandlerFunc) => {
    return (req, res, next) => {

        // Resolve the Promise with the result of the requestHandler.
        // If any error occured, forward the error to the global error handling middleware.
        Promise.resolve(asyncRequestHandlerFunc(req, res, next)).catch(
            (error) => next(error)
        );
    };
};

module.exports = { asyncHandlerAsyncAwait, asyncHandlerPromise };
