const express = require('express');

const translate = require('./translate');
const { generateError } = require('../../utils');

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		console.log('req.query', req.query);
		console.log('req.headers.referer', req.headers.referer);
		const result = await translate(req.query, req.headers.referer);
		console.log('result', result);
		res.json(result);
	} catch (err) {
		next(generateError(err, 'Failed to translate.'));
	}
});

module.exports = router;
