// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig(
	globalIgnores(['dist/', '.angular/']),
	{
		files: ['**/*.ts'],
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommendedTypeChecked,
			angular.configs.tsRecommended,
		],
		languageOptions: {
			parserOptions: {
				projectService: {
					// Only used through the fileReplacements of the production build
					allowDefaultProject: ['src/environments/environment.prod.ts'],
					defaultProject: 'tsconfig.json',
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		processor: angular.processInlineTemplates,
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			// The app still relies on NgModules, constructor injection and eager change detection
			'@angular-eslint/prefer-on-push-component-change-detection': 'off',
			'@angular-eslint/prefer-standalone': 'off',
			'@angular-eslint/prefer-inject': 'off',

			// The code base relies on `any` for loosely typed payloads
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',

			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true,
					allowDirectConstAssertionInArrowFunctions: true,
				},
			],
			'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/unbound-method': 'off',

			'no-console': 'error',
			'object-shorthand': ['error', 'always'],
			'radix': ['error', 'always'],
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
		},
	},
	{
		files: ['**/*.html'],
		extends: [angular.configs.templateRecommended],
	},
	eslintPluginPrettierRecommended,
);
