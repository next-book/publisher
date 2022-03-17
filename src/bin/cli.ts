#!/usr/bin/env node
import cmd from 'commander';
import express from 'express';
import path from 'path';
import map from '../app';
import loadConfig from '../config';
import buildServiceWorker from '../service-worker/builder';
import { writeOutput, copyFolders, prepContent } from '../data-helper';
import { getRevision } from '../revision';

cmd
  .option('-v, --verbose', 'More verbose output')
  .option('-w, --server', 'Start a web server in the book’s directory')
  .option('-s, --src [path]', 'Source directory', 'src')
  .option('-o, --out [path]', 'Output directory', 'book')
  .option('-f, --filter [regex]', 'File filter for mapper sourcers', '\\.html?$')
  .option('-d, --dev', 'Dev mode (no service worker)')
  .option('-p, --preview [url]', 'Generate a preview (three chapters only)')
  .parse(process.argv);

const config = loadConfig(cmd.src, cmd.preview);
// console.log('Config', dumpArray(config));
if (!config) throw new Error('No config set');

const revisionId = config.preview?.isPreview ? `${getRevision()}-preview` : getRevision();
const { content, filenames } = prepContent(
  cmd.src,
  cmd.filter,
  config.preview.isPreview ? config.preview.removeChapters : []
);
const { documents, manifest } = map(content, filenames, config, revisionId);

writeOutput(cmd.out, filenames, documents, manifest);
if (config.static)
  copyFolders('\nCopying static folders…', cmd.src, cmd.out, config.static, () => {
    if (!cmd.dev && revisionId) buildServiceWorker(cmd.out, revisionId);
  });

if (cmd.server) {
  const server = express();
  const port = 23011; // B-O-O-K => 2-15-15-11 => 2-2*15-11 => 2-30-11

  server.use('/', express.static(path.join(process.cwd(), '/', cmd.out)));
  server.listen(port, () => {
    console.log(
      [
        '\nWeb server running at http://127.0.0.1:23011/',
        'Press CTRL+C to stop the server.\n',
      ].join('\n')
    );
  });
}
