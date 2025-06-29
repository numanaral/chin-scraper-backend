const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middleware = require('./middleware');
const api = require('./api');

const app = express();

app.set('json spaces', 4);
app.use(morgan('dev'));
app.use(helmet());
app.use(
	cors({
		credentials: true,
		methods: 'GET',
		// https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b
		origin: (origin, callback) => {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			console.log('origin', origin);
			console.debug('origin', origin);
			if (!origin) return callback(null, true);
			console.log(
				'process.env.ALLOWED_ORIGINS',
				process.env.ALLOWED_ORIGINS.split(',')
			);
			console.debug(
				'process.env.ALLOWED_ORIGINS',
				process.env.ALLOWED_ORIGINS.split(',')
			);
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

app.use(middleware.checkRequiredHeaders);
app.use('/api', api);

app.use(middleware.notFound);
app.use(middleware.errorHandler);

module.exports = app;
