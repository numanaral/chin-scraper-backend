const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.set('json spaces', 4);
app.use(morgan('dev'));
app.use(helmet());
app.use(
	cors({
		credentials: true,
		methods: 'GET',
		origin: (origin, callback) => {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (process.env.ALLOWED_ORIGINS.split(',').indexOf(origin) === -1) {
				const msg =
					'The CORS policy for this site does not ' +
					'allow access from the specified Origin.';
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);
app.use(express.json());

app.get('/', (req, res) => {
	res.json({
		message: "Welcome to the Chinese Scraper's Backend 👋",
	});
});

module.exports = app;
