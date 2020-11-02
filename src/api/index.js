const express = require('express');

const proxy = require('./proxy');
const router = express.Router();

router.get('/', (req, res) => {
	res.json({
		message: 'API',
	});
});

router.use('/proxy', proxy);

module.exports = router;
