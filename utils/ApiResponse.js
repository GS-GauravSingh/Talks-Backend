// Creating a custom class for standardizing API responses. So, that all the API response are in a same format.
class ApiResponse {
    // Constructor
    constructor(statusCode, status, data, message) {
        this.statusCode = statusCode; // HTTP status code.
        this.data = data; // additional information associated with the API Response.
        this.status = status;
        this.message = message; // message
        this.success = statusCode < 400; // if statusCode < 400, then this.success is set to true. Otherwise, it is set to false. If the statusCode is between 500 to 599, then it is considered a Server Error Response. And we have a separate class for handling API Errors.
    }
}

module.exports = ApiResponse;
