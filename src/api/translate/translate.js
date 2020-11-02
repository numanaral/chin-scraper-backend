const translateApi = require('extended-google-translate-api');

translateApi.defaultDataOptions.detailedTranslations = false;
translateApi.defaultDataOptions.definitions = false;
translateApi.defaultDataOptions.examples = false;
translateApi.defaultDataOptions.collocations = false;

const CHINESE = 'zh-CN';
// const ENGLISH = 'en';

/**
 * Separates the text into bits and joins all with |. The goal is to
 * be able to search for the full sentence and the chars separately
 * and get the appropriate full-sentence and char-by-char version
 * translations and pinyins
 *
 * @example
 * ```js
 * getExtendedText('我叫努曼');
 * // Returns: 我叫努曼|我|叫|努|曼
 * ```
 *
 * @param {String} text - Text to be masked for extended translation
 *
 * @returns Masked text
 */
const getExtendedText = text => [text, ...text.split('')].join('|');

/**
 * Decides if we need to translate an extended version or not and
 * returns the appropriate result to translate.
 *
 * @param {String} text - Text to translate
 * @param {Boolean} extended - If extended
 * @param {String} from - Language to translate from
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
 * ```js
 * // zh-CN => en
 * // From URL http://localhost:8080/api/translate?text=我叫努曼&from=zh-CN&to=en&extended=true
 * // Returns:
 * const res = {
 * 	"word": "我叫努曼|我|叫|努|曼",
 * 	"translation": "My name is Numman | I | Call | Nu | Man",
 * 	"wordTranscription": "Wǒ jiào nǔ màn |wǒ |jiào |nǔ |màn",
 * 	"translationTranscription": null
 * }
 *
 * getCustomResult(res);
 * // Returns:
 * {
 * 	"translation": "My name is Numman | I | Call | Nu | Man",
 * 	"transcription": "Wǒ jiào nǔ màn |wǒ |jiào |nǔ |màn",
 * }
 *
 * // en => zh-CN
 * // http://localhost:8080/api/translate?text=my%20name%20is%20Numan&from=en&to=zh-CN&extended=true
 * // Returns:
 * const res = {
 * 	"word": "my name is Numan",
 * 	"translation": "我的名字是numan",
 * 	"translationTranscription": "Wǒ de míngzì shì numan"
 * }
 *
 * getCustomResult(res);
 * // Returns:
 * {
 * 	"translation": "我的名字是numan",
 * 	"transcription": "Wǒ de míngzì shì numan"
 * }
 *
 * ```
 * @param {Object} res - The translation result
 * @param {Object} res.word - Translated word
 * @param {Object} res.translation - Translation result
 * @param {Object} res.wordTranscription
 * - Translated word's transcription
 * @param {Object} res.translationTranscription
 * - Translation result's transcription
 */
const getCustomResult = ({
	// text,
	translation,
	wordTranscription,
	translationTranscription,
}) => ({
	translation,
	transcription: wordTranscription || translationTranscription,
});

// TODO: When translating from EN to CH, allow extended option
// TODO2: Give user the ability to send in their own extension option
/**
 * Translates a given text. Also has an option to translate the word
 * along with characters separately. If wanted, you override the
 * default library options by passing in dataOptions.
 *
 * @param {Object} query - Query containing the required & optional
 * @param {String} query.text - Text to translate
 * @param {String} query.from - Language code to translate from
 * @param {String} query.to - Language code to translate to
 * @param {String} query.extended - If need word + char results
 * @param {String} query.dataOptions - Object to override settings
 *
 * @example
 *
 * @returns - ArrayOf(Object(s)) containing the result(s)
 */
const translate = async query => {
	const { text, from, to, extended = false, dataOptions = {} } = query;

	const _text = getTranslationText(text, extended, from);
	const res = await translateApi(_text, from, to, dataOptions);

	return getCustomResult(res);
};

module.exports = translate;
