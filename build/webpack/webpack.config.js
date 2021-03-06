const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');

const root = path.resolve(__dirname, '../..');
const { version } = require(path.resolve(root, 'package.json'));
const copys = require('./copy.json');

const config = {
	mode: process.env.NODE_ENV,
	context: path.resolve(root, 'src'),
	entry: {
		'background': './background.js',
		'popup/popup': './popup/popup.js',
		'options/options': './options/options.js'
	},
	output: {
		path: path.resolve(root, 'dist'),
		filename: '[name].js'
	},
	resolve: {
		extensions: ['.js', '.vue'],
	},
	performance: {
		hints: false
	},
	module: {
		rules: [{
				test: /\.vue$/,
				loaders: 'vue-loader',
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.less$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
			},
			{
				test: /\.(png|jpg|gif|svg|ico|ttf|eot|woff|woff2)$/,
				loader: 'file-loader',
				options: {
					name: '/assets/[name].[hash].[ext]',
				},
			},
		],
	},
	externals: {
		'vue': 'Vue',
		'vue-material': 'VueMaterial'
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
		new CopyWebpackPlugin([
			...copys,
			{
				from: 'manifest.json',
				to: 'manifest.json',
				transform: (content) => {
					const jsonContent = JSON.parse(content);
					jsonContent.version = version;

					if (config.mode === 'development') {
						jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
					}

					return JSON.stringify(jsonContent);
				},
			},
		])
	],
};

if (config.mode === 'production') {
	config.plugins = (config.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"',
			},
		}),
	]);
}

config.devtool = config.mode === 'production' ? 'none' : 'cheap-module-eval-source-map';

if (process.env.HMR === 'true') {
	config.plugins = (config.plugins || []).concat([
		new ChromeExtensionReloader(),
	]);
}

module.exports = config;