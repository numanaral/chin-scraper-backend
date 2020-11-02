const fetch = require('node-fetch');

const proxy = async url => {
	const fetchRes = await fetch(url);

	if (!fetchRes.ok) {
		throw new Error(`HTTP Error ${fetchRes.status}`);
	}
	const contentType = fetchRes.headers.get('Content-Type').toLowerCase();
	const type =
		(contentType.startsWith('application/json') && 'json') || 'text';
	const result = await fetchRes[type]();

	return result;
};

module.exports = proxy;
