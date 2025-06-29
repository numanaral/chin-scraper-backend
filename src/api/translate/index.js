const express = require('express');

const translate = require('./translate');
const { generateError } = require('../../utils');

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		console.info(`[referer: ${req.headers.referer}] - Query: ${req.query}`);
		const result = await translate(req.query, req.headers.referer);
		res.json(result);
	} catch (err) {
		next(generateError(err, 'Failed to translate.'));
	}
});

module.exports = router;
