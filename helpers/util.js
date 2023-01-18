class Response{
    constructor(data, success = true) {
        this.data = data
        this.success = success
    }
}

module.exports = {
    Response
}