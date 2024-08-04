class ApiError extends Error {
    constructor(
        statusCode, 
        message="Something went wrong", 
        errors = [],
        statck=""
    ) {
        super(message);
        this.status = statusCode;
        this.message = message;
        this.data =null;
        this.errors = errors;
        this.success = false;

        if(statck) {
            this.statck = statck;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError}

    

    // static badRequest(message) {
    //     return new ApiError(400, message);