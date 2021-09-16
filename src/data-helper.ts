import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';
import rimraf from 'rimraf';
import { Manifest } from './app';
import copy from 'recursive-copy';
import * as sw from './service-worker/builder';
import { Config } from './config';

type PathLike = string;

type PrepContent = {
  content: string[];
  filenames: string[];
}

interface BookConfigMetaData {
  title?: string;
  subtitle: string;
  author: string;
  published: number;
  keywords: string[];
}

interface BookConfig extends Config {
  meta: BookConfigMetaData;
  chapters: string[];
  removeChapters: string[];
  static: string[];
}

interface PreviewConfig extends Config {
  chapters: string[];
  removeChapters: string[];
  fullTextUrl: string;
}

type Pair = {from: string, to: string};

export function prepContent(srcDir: PathLike, filter: string, previewRemovals: string[]): PrepContent {
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

export function prepConfig(srcDir: PathLike): BookConfig | null {
  const configPath = path.join(srcDir, '/book.json');
  console.log(`Looking up a custom book config in "${configPath}/".`);

  const bookConfig: BookConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : null;
  console.log(bookConfig ? 'Found custom book config.' : 'Custom book config not found.');

  return bookConfig;
}

export function prepPreviewConfig(srcDir: PathLike, fullTextUrl: string): PreviewConfig {
  console.log('Preparing preview version of the book.');

  const config = prepConfig(srcDir);
  return Object.assign({}, config, {
    chapters: config?.chapters?.slice(0, 3),
    removeChapters: config?.chapters?.slice(3),
    fullTextUrl,
  });
}

export function writeOutput(dir: PathLike, filenames: string[], documents: (string | JSDOM)[], manifest: Manifest): void {
  if (fs.existsSync(dir)) rimraf.sync(dir);
  fs.mkdirSync(dir);

  filenames.forEach((filename, index) => {
    if (typeof documents[index] === 'string') {
      fs.writeFileSync(path.join(dir, filename), documents[index] as string);
    } else {
      fs.writeFileSync(path.join(dir, filename),documents[index].toString());
    }
  });

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

export function copyFolders(message: string, src: string, out: string, folders: string[], callback: () => void): void {
  console.log(message);

  if (folders && Array.isArray(folders)) {
    const pairs = folders.map(folder => ({
      from: path.join(src, folder),
      to: path.join(out, folder),
    }));

    copyFolder(pairs, callback);
  }
}

export function copyFolder(pairs: Pair[], finalCallback: () => void):void {
  if (pairs.length === 0) return;
  /**
   * pairs array will never be empty at this point, since we check its length,
   * hence the type assertion below is ok
   */ 
  const pair = pairs.shift() as unknown as Pair; 

  copy(pair.from, pair.to, () => {
    if (pairs.length > 0) copyFolder(pairs, finalCallback);
    else finalCallback();
  });
}

export async function buildServiceWorker(dir: PathLike, revision: string): Promise<void> {
  console.log('Building service worker…');

  await sw.build(dir, revision).then(code => {
    fs.writeFileSync(path.join(dir, 'service-worker.js'), code, 'utf8');
  });
}
