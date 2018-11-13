const fs = require('fs');
const path = require('path');

const rimraf = require('rimraf');
const ncp = require('ncp');

function prepContent(srcDir, filter) {
  console.log(`Looking up files in "${srcDir}" (using filename filter \\${filter}\\).`);

  const content = fs.readdirSync(srcDir, {
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

  const bookConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : null;
  console.log(bookConfig ? 'Found custom book config.' : 'Custom book config not found.');

  return bookConfig;
}

function writeOutput(dir, filenames, documents, metadata) {
  if (fs.existsSync(dir)) rimraf.sync(dir);
  fs.mkdirSync(dir);

  filenames.forEach((filename, index) => {
    fs.writeFileSync(path.join(dir, filename), documents[index]);
  });

  fs.writeFileSync(
    path.join(dir, 'spine.json'),
    JSON.stringify(
      metadata,
      null,
      2,
    ),
  );
}

function copyFolders(message, src, out, folders) {
  console.log(message);

  if (folders && Array.isArray(folders)) {
    folders.forEach(folder => ncp(
      path.join(src, folder),
      path.join(out, folder),
      (err) => {
        if (err) console.error(err);
        else console.log(`Copied folder "${folder}".`);
      },
    ));
  }
}

module.exports = {
  prepContent,
  prepConfig,
  writeOutput,
  copyFolders,
};
