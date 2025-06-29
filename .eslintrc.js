const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
	env: {
		node: true,
		commonjs: true,
		es2021: true,
	},
	extends: ['airbnb-base', 'plugin:prettier/recommended'],
	parserOptions: {
		ecmaVersion: 12,
	},
	plugins: ['prettier'],
	// settings: {
	// 	'import/resolver': {
	// 		node: {
	// 			extensions: ['.js'],
	// 			paths: ['./src'],
	// 		},
	// 	},
	// },
	rules: {
		'arrow-parens': [ERROR, 'as-needed'],
		'default-case': [ERROR, { commentPattern: 'No Default' }],
		'import/no-named-as-default': OFF,
		'import/prefer-default-export': OFF,
		'linebreak-style': [ERROR, 'unix'],
		'max-len': [
			ERROR,
			{
				ignoreComments: false,
				ignoreUrls: true,
				ignoreRegExpLiterals: true,
				ignoreTrailingComments: true,
				ignoreTemplateLiterals: true,
			},
		], // *
		'no-alert': WARN,
		'no-console': OFF,
		'no-continue': OFF,
		'no-plusplus': OFF,
		'no-tabs': OFF,
		'no-underscore-dangle': OFF,
		'prettier/prettier': ERROR,
	},
};
