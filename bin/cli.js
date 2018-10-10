#!/usr/bin/env node
const cmd = require('command-line-args');

const app = require('../src/app.js');
const data = require('../src/data-helper.js');

const args = cmd([
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'src', type: String, defaultValue: './src' },
  { name: 'out', type: String, defaultValue: './book' },
  { name: 'filter', type: String, defaultValue: '\\.html?$' },
]);

const config = data.prepConfig(args.src);
const { content, filenames } = data.prepContent(args.src, args.filter);
const { documents, metadata } = app.map(content, filenames, config);

data.writeOutput(args.out, filenames, documents, metadata);
data.copyFolders('\nCopying static folders…', args.src, args.out, config.static);

