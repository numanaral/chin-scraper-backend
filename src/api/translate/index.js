const express = require('express');

const translate = require('./translate');
const { generateError } = require('../../utils');

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const result = await translate(req.query);
		res.json(result);
	} catch (err) {
		next(generateError(err, 'Failed to translate.'));
	}
});

module.exports = router;
