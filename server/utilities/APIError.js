class APIError {
    constructor(statusCode, message, code = "ERROR", success = false) {
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.success = success;
    }
}


export default APIError;