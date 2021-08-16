import fs from 'fs';
import glob from 'recursive-readdir';

type PathLike = string;

export async function build(dir: PathLike, revision: string): Promise<string> {
  const code = fs.readFileSync(`${__dirname}/code.tpl.js`, 'utf8');

  return glob(dir).then(paths => {
    const assets = listAssets(dir, paths);
    return code.replace('%assets%', JSON.stringify(assets)).replace('%revision%', revision);
  });
}

function listAssets(dir: PathLike, paths: string[]) {
  return ['./', ...shiftRelative(dir, paths)];
}

function shiftRelative(dir: PathLike, assets: string[]) {
  return assets.map(path => path.replace(new RegExp(`^\\.?\\/?${dir}`), '.'));
}
