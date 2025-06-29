// Due to not being able to pass referrer to the Google Translate API, falling
// back to making a request with REST API.
// const { Translate } = require('@google-cloud/translate').v2;
const fetch = require('node-fetch');
const { firstCapital } = require('../../utils');
// Import pinyinjs, it has bunch of global set,
// but I don't have time to modify that right now.
// I will probably use another library as I don't
// want the " " in-between the characters.
require('./sxei-pinyinjs');

const REGEX_STRIP_NON_CHINESE_CHARS = /[^\p{Script=Han}]+/gu;
const stripNonChineseChars = text => {
	return text.replace(REGEX_STRIP_NON_CHINESE_CHARS, '');
};

const makeTranslateRequest = async (textsToTranslate, from, to, referrer) => {
	const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Referer: referrer || process.env.ALLOWED_ORIGINS?.split(',')[0],
		},
		body: JSON.stringify({
			q: textsToTranslate,
			source: from,
			target: to,
			format: 'text',
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errorText}`);
	}

	return response.json();
};

const getTranslations = async (text, from, to, referrer) => {
	const strippedChineseChars = stripNonChineseChars(text).split('');
	const textsToTranslate = [text, ...strippedChineseChars];

	const response = await makeTranslateRequest(
		textsToTranslate,
		from,
		to,
		referrer
	);

	return response.data.translations.map(t => t.translatedText);
};

const getPinyin = text => {
	return global.pinyinUtil.getPinyin(text, ' ', true, true);
};

/**
 * Create an understandable text for the front-end.
 *
 * @example
 * ```js
 * maskResult(['Hello there', 'you', 'good'], 'nǐ hǎo', '你好');
 * // Returns:
 * {
 *   "translation": "Hello there|you|good",
 *   "transcription": "nǐ hǎo|nǐ|hǎo"
 * }
 * ```
 *
 * @param {Array} translations Array of translations (full sentence + chars)
 * @param {String} pinyin Full sentence pinyin
 * @param {String} originalText Original Chinese text
 *
 * @returns Masked text
 */
const maskResult = (translations, pinyin, originalText) => {
	// Get individual character pinyin by splitting the original text
	// and getting pinyin for each character.
	const chineseChars = stripNonChineseChars(originalText).split('');
	const individualPinyin = chineseChars.map(char => {
		try {
			return getPinyin(char).trim();
		} catch (err) {
			// Fallback to original character if pinyin fails.
			return char;
		}
	});

	// Combine full sentence pinyin with individual character pinyin.
	const combinedPinyin = [pinyin, ...individualPinyin];

	return {
		translation: firstCapital(translations.join('|').toLowerCase()),
		transcription: combinedPinyin.join('|').toLowerCase(),
	};
};

const getTranslationAndPinyin = async (query, referrer) => {
	const { text, from, to } = query;

	let result = {};
	let pinyin = '';
	let translations = [];

	if (from !== 'zh-CN' || to !== 'en') {
		throw new Error(
			`Unsupported language pair. Currently only supports Chinese to English.`
		);
	}

	// Get the pinyin.
	try {
		pinyin = getPinyin(text);
	} catch (err) {
		throw new Error(
			`Failed to get the pinyin from "${text}". ${err.message}`
		);
	}

	// Get the translation.
	try {
		// Extract translations from Google Translate response.
		translations = await getTranslations(text, from, to, referrer);
		if (!translations.length) {
			throw new Error(
				'No translations received from Google Translate API.'
			);
		}
	} catch (err) {
		throw new Error(`Failed to translate "${text}". ${err.message}`);
	}

	// Mask the result.
	try {
		result = maskResult(translations, pinyin, text);
	} catch (err) {
		throw new Error(
			`Failed to mask the result "${JSON.stringify(
				translations
			)}" and "${pinyin}"`
		);
	}

	return result;
};

const translate = async (query, referrer) => {
	return getTranslationAndPinyin(query, referrer);
};

module.exports = translate;
