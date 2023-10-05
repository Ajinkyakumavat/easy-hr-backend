const ErrorHandler = require('../utilis/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;


    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    // if (process.env.NODE_ENV === 'PRODUCTION') {
    //
    //     let error = {...err};
    //     error.message = err.message;
    //
    //     //Wrong Mongoose Object ID error
    //     if (err.name === 'CatchError') {
    //         const message = `Resource Not Found. Invalid ${err.path}`
    //         error = new ErrorHandler(message, 400)
    //     }
    //
    //     //Handling Mongoose validation error
    //     if (err.name === 'ValidationError') {
    //         const message = Object.values(err.error).map(value => {
    //             value.message
    //         })
    //         error = new ErrorHandler(message, 400)
    //     }
    //
    //     //Handling Mongoose Duplication error
    //     if (err.name === 11000) {
    //         const message = `Duplicate ${Object.keys(err.keyValue)} entered`
    //         error = new ErrorHandler(message, 400)
    //     }
    //
    //     //Handling wrong JWT error
    //     if (err.name === 'JsonWebTokenError') {
    //         const message = 'JSON Web token is invalid, Try Again!!'
    //         error = new ErrorHandler(message, 400)
    //     }
    //
    //     //Handling wrong JWT error
    //     if (err.name === 'TokenExpiredError') {
    //         const message = 'JSON Web token is expired, Try Again!!'
    //         error = new ErrorHandler(message, 400)
    //     }
    //
    //     res.status(error.statusCode).json({
    //         success: false,
    //         message: error.message || "Internal Server Error"
    //     })
    // }


}
