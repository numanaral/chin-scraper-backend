/**
 * Generates an error message based on the env and custom messages
 * @param {Error} err - The error caught
 * @param {String} userMessage - Message that prod user see
 * @param {String} devMessage - Message that dev sees on top of the error caught
 */
const generateError = (err, userMessage, devMessage = '') => {
	const message =
		// (process.env.NODE_ENV === 'production' && userMessage) ||
		`${
			(!devMessage && '') ||
			`${devMessage}${(!devMessage.endsWith('.') && '.') || ''} `
		}${err.message}`;

	return new Error(message);
};

const firstCapital = s => (s && s[0].toUpperCase() + s.slice(1)) || '';

module.exports = {
	generateError,
	firstCapital,
};
