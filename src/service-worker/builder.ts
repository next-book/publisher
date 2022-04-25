import fs from 'fs';
import glob from 'recursive-readdir';
import { PathLike } from '../utils/fs';
import { Revision } from '../../shared/manifest';
import path from 'path';

export async function build(dir: PathLike, revision: Revision): Promise<string> {
  const code = fs.readFileSync(`${__dirname}/code.tpl.js`, 'utf8');

  return glob(dir).then(paths => {
    const assets = listAssets(dir, paths);
    return code.replace("'%assets%'", JSON.stringify(assets)).replace('%revision%', revision);
  });
}

function listAssets(dir: PathLike, paths: string[]) {
  return ['./', ...shiftRelative(dir, paths)];
}

function shiftRelative(dir: PathLike, assets: string[]) {
  return assets.map(path => path.replace(new RegExp(`^\\.?\\/?${dir}`), '.'));
}

async function buildServiceWorker(dir: PathLike, revision: Revision): Promise<void> {
  console.log('Building service worker…');

  await build(dir, revision).then(code => {
    fs.writeFileSync(path.join(dir, 'service-worker.js'), code, 'utf8');
  });
}

export default buildServiceWorker;
