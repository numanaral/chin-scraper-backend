/* eslint-disable max-len */
const translateApi = require('extended-google-translate-api');

translateApi.defaultDataOptions.detailedTranslations = false;
translateApi.defaultDataOptions.definitions = false;
translateApi.defaultDataOptions.examples = false;
translateApi.defaultDataOptions.collocations = false;

const CHINESE = 'zh-CN';
// const ENGLISH = 'en';

// const REGEX_CHINESE = /\p{Script=Han}/u;
// const isChinese = text => REGEX_CHINESE.test(text);
const REGEX_STRIP_NON_CHINESE_CHARS = /[^\p{Script=Han}]+/gu;
const stripNonChineseChars = text =>
	text.replace(REGEX_STRIP_NON_CHINESE_CHARS, '');

/**
 * Separates the text into bits and joins all with |. The goal is to
 * be able to search for the full sentence and the chars separately
 * and get the appropriate full-sentence and char-by-char version
 * translations and pinyins
 *
 * @example
 * ```js
 * getExtendedText('你好，我叫努曼！');
 * // Returns: 我叫，努曼！|我|叫|努|曼
 * ```
 *
 * @param {String} text Text to be masked for extended translation
 *
 * @returns Masked text
 */
const getExtendedText = text =>
	[text, ...stripNonChineseChars(text).split('')].join('|');

/**
 * Decides if we need to translate an extended version or not and
 * returns the appropriate result to translate.
 *
 * @param {String} text Text to translate
 * @param {Boolean} extended If extended
 * @param {String} from Language to translate from
 *
 * @returns Extended or not extended translation text
 */
const getTranslationText = (text, extended, from) =>
	(extended && from === CHINESE && getExtendedText(text)) || text;

/**
 * Customize the response with translation and transcription only.
 * We are doing this to filter out unnecessary data sent back and
 * to normalize the result so that we have "transcription" as one.
 * This is opinionated as the transcription will come from the
 * the Chinese word/translation.
 *
 * @example
 * ```js
 * // zh-CN => en
 * // From URL http://localhost:8080/api/translate?text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E5%8F%AB%E5%8A%AA%E6%9B%BC%EF%BC%81&from=zh-CN&to=en&extended=true
 * // Text in the URL: 你好，我叫努曼！
 * // Returns:
 * const res = {
 * 	"translation": "Hello, my name is Numan! | You | good | I | call | Nu | Man",
 * 	"transcription": "Nǐ hǎo, wǒ jiào nǔ màn!|Nǐ |hǎo |wǒ |jiào |nǔ |màn"
 * }
 *
 * // en => zh-CN
 * // http://localhost:8080/api/translate?text=my%20name%20is%20Numan&from=en&to=zh-CN&extended=true
 * // Text in the URL: Hello, my name is Numan!
 * // Returns:
 * const res = {
 *	"translation": "你好，我的名字是努曼！你好，我的名字是努曼！",
 *	"transcription": "Nǐ hǎo, wǒ de míngzì shì nǔ màn!"
 * }
 *
 * ```
 * @param {Object} res The translation result
 * @param {Object} res.word Translated word
 * @param {Object} res.translation Translation result
 * @param {Object} res.wordTranscription Translated word's transcription
 * @param {Object} res.translationTranscription Translation result's transcription
 */
const getCustomResult = ({
	translation,
	wordTranscription,
	translationTranscription,
}) => ({
	translation,
	transcription: wordTranscription || translationTranscription,
});

// Indexes for where these results are located in the final array
const TRANSLATION_INDEX = 0;
const WORD_TRANSCRIPTION_INDEX = 3;
const TRANSLATION_TRANSCRIPTION_INDEX = 2;

/**
 * Parses translation raw result in case user enters Chinese
 * punctuation and the default parsing algorithm doesn't apply.
 *
 * @description
 * - Raw response from:	http://localhost:8080/api/translate?text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E5%8F%AB%E5%8A%AA%E6%9B%BC%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81&from=zh-CN&to=en&extended=true&raw=true
 * - Translated sentence:	你好，我叫努曼！！！
 *
 * - Extra Chinese punctuation gets separated as different "sentences"/groups
 * - [
 *		[
 *			[
 *	            "Hello, my name is Numan! ", // => TRANSLATION START
 *	            "你好，我叫努曼！",
 *	            null,
 *	            null,
 *	            0
 *	        ],
 *	        [
 *	            "! ", // => ... CONTINUE TRANSLATION ...
 *	            "！",
 *	            null,
 *	            null,
 *	            0
 *	        ],
 *	        [
 *	            "! ", // => ... CONTINUE TRANSLATION ...
 *	            "！",
 *	            null,
 *	            null,
 *	            0
 *	        ],
 *	        [
 *	            "| You | good | I | call | Nu | Man", // => TRANSLATION END
 *	            "|你|好|我|叫|努|曼",
 *	            null,
 *	            null,
 *	            0
 *	        ],
 *	        [
 *	            null,
 *	            null,
 *	            null,
 *	            "Nǐ hǎo, wǒ jiào nǔ màn!!!|Nǐ |hǎo |wǒ |jiào |nǔ |màn"	// => WORD TRANSCRIPTION
 *	        ]
 *		]
		// NOT INTERESTED IN THE REST OF THE RESPONSE
 *	]
 */
const parseResultFromRaw = res => {
	const base = res[0];

	// Collect translation pieces:
	// Adding chinese punctuation (special characters) to the
	// translation adds extra arrays as results.
	// [see: @description]
	// So to make sure we always get consistent results, we need
	// to go through the entire array and append the results.

	// Latest translation array is the array before the last in
	// the base
	const translationEnd = base.length - 2;
	let translation = '';
	let i = 0;
	while (i <= translationEnd) {
		// This is where the translation resides in
		translation += base[i][TRANSLATION_INDEX];
		i++;
	}

	// Both word and translation transcription array is the last
	// array of the base
	const transcriptionBaseIndex = res[0].length - 1;
	// This is where the word transcription resides in
	const wordTranscription =
		base[transcriptionBaseIndex][WORD_TRANSCRIPTION_INDEX];
	const translationTranscription =
		base[transcriptionBaseIndex][TRANSLATION_TRANSCRIPTION_INDEX];

	return {
		translation,
		wordTranscription,
		translationTranscription,
	};
};

// TODO: When translating from EN to CH, allow extended option
// This might be a lot of work as we can't just assume char/word
// when it's from ENG. Worry about this in the future
// TODO2: Give user the ability to send in their own extension option
/**
 * Translates a given text. Also has an option to translate the word
 * along with characters separately. If wanted, you override the
 * default library options by passing in dataOptions.
 *
 * @param {Object} query Query containing the required & optional
 * @param {String} query.text Text to translate
 * @param {String} query.from Language code to translate from
 * @param {String} query.to Language code to translate to
 * @param {String} query.extended If need word + char results
 * @param {String} query.dataOptions Object to override settings
 *
 * @example
 * ```js
 * // zh-CN => en
 * const res = await translate({
 * 	text: '你好，我叫努曼！',
 *	from: 'zh-CN',
 *	to: 'en',
 *	extended: true,
 * })
 *
 * // Returns:
 * const res = {
 * 	"translation": "Hello, my name is Numan! | You | good | I | call | Nu | Man",
 * 	"transcription": "Nǐ hǎo, wǒ jiào nǔ màn!|Nǐ |hǎo |wǒ |jiào |nǔ |màn"
 * }
 *
 * // en => zh-CN
 * const res = await translate({
 * 	text: 'Hello, my name is Numan!',
 *	from: 'en',
 *	to: 'zh-CN',
 *	extended: true,
 * })
 *
 * // Returns:
 * const res = {
 *	"translation": "你好，我的名字是努曼！你好，我的名字是努曼！",
 *	"transcription": "Nǐ hǎo, wǒ de míngzì shì nǔ màn!"
 * }
 * ```
 *
 * @returns ArrayOf(Object(s)) containing the result(s)
 */
const translate = async query => {
	const {
		text,
		from,
		to,
		extended = false,
		raw = false,
		dataOptions = {},
	} = query;

	const _text = getTranslationText(text, extended, from);
	const res = await translateApi(_text, from, to, {
		...dataOptions,
		returnRawResponse: true,
	});

	return raw ? res : getCustomResult(parseResultFromRaw(res));
};

module.exports = translate;
