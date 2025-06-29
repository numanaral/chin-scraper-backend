/**
 * Makes sure to prevent URL/browser access on prod
 *
 * @see https://github.com/Rob--W/cors-anywhere/blob/528ad7109fa55bdde8055dd035bb16140a29c336/lib/cors-anywhere.js#L290
 *
 * @param {import("express").Request} req - Request
 * @param {import("express").Response} res - Response
 * @param {import("express").NextFunction} next - Next
 */
const checkRequiredHeaders = (req, res, next) => {
	const { headers } = req;
	let error;
	if (process.env.NODE_ENV === 'production') {
		const hasRequiredHeaders = [
			'origin',
			'x-requested-with',
		].some(headerName => Object.hasOwnProperty.call(headers, headerName));
		if (!hasRequiredHeaders) {
			error = new Error(
				`You don't have the required headers to make a request. Headers: ${headers}`
			);
		}
	}
	next(error);
};

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
	const errorStack = { stack: err.stack };
	console.error(`[Error: ${err.message}] - Stack:\n${errorStack}`);
	res.status(statusCode);
	res.json({
		success: false,
		message: err.message,
		...(process.env.NODE_ENV !== 'production' && errorStack),
	});
};

module.exports = {
	checkRequiredHeaders,
	notFound,
	errorHandler,
};
