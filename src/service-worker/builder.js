const fs = require('fs');
const glob = require('recursive-readdir');

function build(dir, revision) {
  const code = fs.readFileSync(`${__dirname}/code.tpl.js`, 'utf8');

  return glob(dir).then(paths => {
    const assets = listAssets(dir, paths);
    return code.replace('%assets%', JSON.stringify(assets)).replace('%revision%', revision);
  });
}

function listAssets(dir, paths) {
  return ['./', ...shiftRelative(dir, paths)];
}

function shiftRelative(dir, assets) {
  return assets.map(path => path.replace(new RegExp(`^\\.?\\/?${dir}`), '.'));
}

module.exports = {
  build,
};
