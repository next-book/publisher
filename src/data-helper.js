const fs = require('fs');
const path = require('path');

const rimraf = require('rimraf');
const copy = require('recursive-copy');

const sw = require('./service-worker/builder.js');

function prepContent(srcDir, filter) {
  console.log(`Looking up files in "${srcDir}" (using filename filter \\${filter}\\).`);

  const content = fs
    .readdirSync(srcDir, {
      encoding: 'utf8',
      withFileTypes: true,
    })
    .filter(file => file.isFile() && file.name.match(new RegExp(filter)))
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

function writeOutput(dir, filenames, documents, metadata) {
  if (fs.existsSync(dir)) rimraf.sync(dir);
  fs.mkdirSync(dir);

  filenames.forEach((filename, index) => {
    fs.writeFileSync(path.join(dir, filename), documents[index]);
  });

  fs.writeFileSync(path.join(dir, 'spine.json'), JSON.stringify(metadata, null, 2));
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

module.exports = {
  prepContent,
  prepConfig,
  writeOutput,
  copyFolders,
  buildServiceWorker,
};
