const { Translate } = require('@google-cloud/translate').v2;
const { firstCapital } = require('../../utils');
// import pinyinjs, it has bunch of global set,
// but I don't have time to modify that right now
// I will probably use another library as I don't
// want the " " in-between the characters...
require('./sxei-pinyinjs');

const REGEX_STRIP_NON_CHINESE_CHARS = /[^\p{Script=Han}]+/gu;
const stripNonChineseChars = text =>
	text.replace(REGEX_STRIP_NON_CHINESE_CHARS, '');

// init Google Translate client
const googleTranslate = new Translate({ key: process.env.GOOGLE_API_KEY });

const getTranslations = (text, from, to) =>
	googleTranslate.translate([text, ...stripNonChineseChars(text).split('')], {
		from,
		to,
	});

const getPinyin = text => global.pinyinUtil.getPinyin(text, ' ', true, true);

/**
 * Create an understandable text for the front-end.
 *
 * @example
 * ```js
 * maskResult(['you', 'good'], 'nǐ hǎo');
 * // Returns:
 * {
 *   "translation": "Hello there|you|it is good",
 *   "pinyin": "nǐ hǎo|nǐ|hǎo"
 * }
 * ```
 *
 * @param {String} text Text to be masked for extended translation
 *
 * @returns Masked text
 */
const maskResult = (translations, pinyin) => ({
	translation: firstCapital(translations.join('|').toLowerCase()),
	transcription: [pinyin, ...pinyin.split(' ')].join('|').toLowerCase(),
});

const getTranslationAndPinyin = async query => {
	const { text, from, to } = query;

	let result = {};
	let pinyin = '';
	let translations = [];

	// Get the pinyin
	try {
		pinyin = getPinyin(text);
	} catch (err) {
		throw new Error(
			`Failed to get the pinyin from "${text}". ${err.message}`
		);
	}

	// Get the translation
	try {
		[translations] = await getTranslations(text, from, to);
	} catch (err) {
		throw new Error(`Failed to translate "${text}". ${err.message}`);
	}

	// Google suggestion, I don't see this necessary? Will keep here for now
	// eslint-disable-next-line max-len
	// translations = Array.isArray(translations) ? translations : [translations];

	// Mask the result
	try {
		result = maskResult(translations, pinyin);
	} catch (err) {
		// eslint-disable-next-line prettier/prettier
		throw new Error(`Failed to mask the result "${JSON.stringify(translations)}" and "${pinyin}"`);
	}

	return result;
};

const translate = async query => {
	return getTranslationAndPinyin(query);
};

module.exports = translate;
