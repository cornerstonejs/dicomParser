const path = require('path');
const env = process.env.ENV || 'dev';
const config = require(`./webpack-${env}.cjs`);

module.exports = config;
