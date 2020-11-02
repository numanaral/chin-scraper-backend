const express = require('express');

const proxy = require('./proxy');
const { generateError } = require('../../utils');

const router = express.Router();

router.get('/*', async (req, res, next) => {
	try {
		const result = await proxy(req.params[0]);
		res.send(result);
	} catch (err) {
		next(generateError(err, 'Failed to proxy.'));
	}
});

module.exports = router;
