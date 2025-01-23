// Creating custom error class for standardizing API Errors. So, that all the API errors are in a same format.
// JavaScript provide and in-built `Error` class for handling errors. If you are creating you own custom error class for handling any specific type of all types of errors, then your class must inherit the built-in `Error` class.
class ApiError extends Error {
    // Constructor.
    constructor(
        statusCode,
        message = "Something went wrong!!",
        errors = [],
        errorStack = ""
    ) {
        // calling the parent class constructor.
        super(message);

        this.statusCode = statusCode; // HTTP status code.
        this.status = statusCode >= 400 && statusCode < 500 ? "Client Error" : "Internal Server Error";
        this.data = null; // data property is used to provide any additional information associated with the error.
        this.message = message; // error message.
        this.success = false; // success is set to false because this class is used to handle errors and if there is any error then `success` has to be false.
        this.errors = errors; // in case of multiple arrays.

        // Setting up the stack track. Stack Trace is like a snapshot of the functions(s) call stack. It helps us in debugging the code because it shows where an error is occured.
        if (errorStack) {
            // If the errorStack is passed to the ApiError constructor, it is directly assigned to `this.stack`.
            this.stack = errorStack;
        } else {
            // If don't have a stack track. Then use the Error class to captures the stack track.
            // It automatically creates a `stack` property on target object which contains the series of function calls that led to an error.
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
