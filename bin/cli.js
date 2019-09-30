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
const { documents, manifest } = app.map(content, filenames, config, revision);

data.writeOutput(cmd.out, filenames, documents, manifest);
data.copyFolders('\nCopying static folders…', cmd.src, cmd.out, config.static, () => {
  data.buildServiceWorker(cmd.out, revision);
});

if (cmd.server) {
  const server = express();
  const port = 23011; // B-O-O-K => 2-15-15-11 => 2-2*15-11 => 2-30-11

  server.use('/', express.static(path.join(process.cwd(), '/', cmd.out)));
  server.listen(port, () => {
    const message = [
      '\nWeb server running at http://127.0.0.1:23011/',
      'Press CTRL+C to stop the server.\n',
    ].join('\n');
    console.log(message);
  });
}
