#!/usr/bin/env node
const cmd = require('commander');
const express = require('express');
const path = require('path');

const app = require('../src/app.js');
const data = require('../src/data-helper.js');
const revision = require('../src/revision.js').get();

cmd
  .option('-v, --verbose', 'More verbose output')
  .option('-w, --server', 'Start a web server in the book’s directory')
  .option('-s, --src [path]', 'Source directory', 'src')
  .option('-o, --out [path]', 'Output directory', 'book')
  .option('-f, --filter [regex]', 'File filter for mapper sourcers', '\\.html?$')
  .parse(process.argv);

const config = data.prepConfig(cmd.src);
const { content, filenames } = data.prepContent(cmd.src, cmd.filter);
const { documents, spine } = app.map(content, filenames, config);

data.writeOutput(cmd.out, filenames, documents, spine);
data.copyFolders('\nCopying static folders…', cmd.src, cmd.out, config.static);

if (cmd.server) {
  const server = express();
  const port = 3000;

  server.use('/', express.static(path.join(process.cwd(), '/', cmd.out)));
  server.listen(port, () => {
    const message = [
      '\nWeb server running at http://localhost:3000/',
      'Press CTRL+C to stop the server.\n',
    ].join('\n');
    console.log(message);
  });
}
