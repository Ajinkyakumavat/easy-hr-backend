//Handling Errors

class ErrorHandler extends Error{   //Error is a Parent Class and Error Handler is a Child Class
    constructor(message,statusCode) {
        super(message); //Constructor of the parent Class
        this.statusCode = statusCode; //Set the statusCode

        Error.captureStackTrace(this,this.constructor)
    }
}
module.exports = ErrorHandler;
