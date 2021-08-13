
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import copy from 'recursive-copy';
import * as sw from './service-worker/builder';

function prepContent(srcDir, filter, previewRemovals) {
  console.log(`Looking up files in "${srcDir}" (using filename filter \\${filter}\\).`);

  const content = fs
    .readdirSync(srcDir, {
      encoding: 'utf8',
      withFileTypes: true,
    })
    .filter(file => file.isFile() && file.name.match(new RegExp(filter)))
    .filter(file => previewRemovals === undefined || !previewRemovals.includes(file.name))
    .map(file => ({
      name: file.name,
      data: fs.readFileSync(path.join(srcDir, file.name), 'utf8'),
    }));

  content.forEach(file => console.log(`> ${file.name}`));

  return { content: content.map(file => file.data), filenames: content.map(file => file.name) };
}

function prepConfig(srcDir) {
  const configPath = path.join(srcDir, '/book.json');
  console.log(`Looking up a custom book config in "${configPath}/".`);

  const bookConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : null;
  console.log(bookConfig ? 'Found custom book config.' : 'Custom book config not found.');

  return bookConfig;
}

function prepPreviewConfig(srcDir, fullTextUrl) {
  console.log('Preparing preview version of the book.');

  const config = prepConfig(srcDir);
  if (!config) return null;
  return Object.assign({}, config, {
    chapters: config.chapters.slice(0, 3),
    removeChapters: config.chapters.slice(3),
    fullTextUrl,
  });
}

function writeOutput(dir, filenames, documents, metadata) {
  if (fs.existsSync(dir)) rimraf.sync(dir);
  fs.mkdirSync(dir);

  filenames.forEach((filename, index) => {
    fs.writeFileSync(path.join(dir, filename), documents[index]);
  });

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(metadata, null, 2));
}

function copyFolders(message, src, out, folders, callback) {
  console.log(message);

  if (folders && Array.isArray(folders)) {
    const pairs = folders.map(folder => ({
      from: path.join(src, folder),
      to: path.join(out, folder),
    }));

    copyFolder(pairs, callback);
  }
}

function copyFolder(pairs, finalCallback) {
  const pair = pairs.shift();

  copy(pair.from, pair.to, () => {
    if (pairs.length > 0) copyFolder(pairs, finalCallback);
    else finalCallback();
  });
}

function buildServiceWorker(dir, revision) {
  console.log('Building service worker…');

  sw.build(dir, revision).then(code => {
    fs.writeFileSync(path.join(dir, 'service-worker.js'), code, 'utf8');
  });
}

export {
  prepContent,
  prepConfig,
  prepPreviewConfig,
  writeOutput,
  copyFolders,
  buildServiceWorker,
}
