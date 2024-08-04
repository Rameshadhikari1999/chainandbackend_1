class ApiREsponse {
    constructor(statusCode, message ="Success", data, success = true) {
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 400
    }
}