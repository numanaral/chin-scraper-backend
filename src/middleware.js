/**
 * Handles not found
 *
 * @param {import("express").Request} req - Request
 * @param {import("express").Response} res - Response
 * @param {import("express").NextFunction} next - Next
 */
const notFound = (req, res, next) => {
	res.status(404);
	const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
	next(error);
};

/**
 * Handles errors
 *
 * @param {Error} err - Error
 * @param {import("express").Request} req - Request
 * @param {import("express").Response} res - Response
 * @param {import("express").NextFunction} next - Next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
	const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
	res.status(statusCode);
	res.json({
		success: false,
		message: err.message,
		...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
	});
};

module.exports = {
	notFound,
	errorHandler,
};
