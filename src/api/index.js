const express = require('express');

const proxy = require('./proxy');
const translate = require('./translate');

const router = express.Router();

router.get('/', (req, res) => {
	res.json({
		message: 'API',
	});
});

router.use('/proxy', proxy);
router.use('/translate', translate);

module.exports = router;
