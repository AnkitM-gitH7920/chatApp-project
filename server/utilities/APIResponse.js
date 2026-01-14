class APIResponse {
    constructor(success, statusCode, message, data = null) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data
    }
}

export default APIResponse;