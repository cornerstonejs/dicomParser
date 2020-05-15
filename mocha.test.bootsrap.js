require('ts-node').register({
	extends: "'./tsconfig.json",
	compilerOptions: {
		module: 'commonjs',
	},
});
