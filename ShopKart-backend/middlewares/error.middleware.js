/**
 * Runs when any controller passes an error to next(err).
 * Registered last in index.js.
 */
const errorMiddleware = (error, req, res, next) => {
    console.error(error);

    // 11000 = MongoDB unique index violation.
    // Happens if the same email gets registered twice at the exact same moment.
    if (error.code === 11000) {
        return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // body-parser sets statusCode 400 when the JSON body cannot be parsed
    const status = error.statusCode || 500;

    return res.status(status).json({
        success: false,
        message: status === 500 ? "Internal Server Error" : error.message
    });
};

export default errorMiddleware;