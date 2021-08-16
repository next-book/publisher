
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import copy from 'recursive-copy';
import * as sw from './service-worker/builder';

type PathLike = string;

type PrepContent = {
  content: string[];
  filenames: string[];
}

interface BookConfigMetaData {
  title: string;
  subtitle: string;
  author: string;
  published: number;
  keywords: string[];
}

interface BookConfig {
  meta: BookConfigMetaData;
  chapters: string[];
  static: string[];
}

type PreviewConfig = {
  chapters: string[];
  removeChapters: string[];
  fullTextUrl: string;
} | null;

type Pair = {from: string, to: string};

function prepContent(srcDir: PathLike, filter: string, previewRemovals: string[]): PrepContent {
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

function prepConfig(srcDir: PathLike): BookConfig | null {
  const configPath = path.join(srcDir, '/book.json');
  console.log(`Looking up a custom book config in "${configPath}/".`);

  const bookConfig: BookConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : null;
  console.log(bookConfig ? 'Found custom book config.' : 'Custom book config not found.');

  return bookConfig;
}

function prepPreviewConfig(srcDir: PathLike, fullTextUrl: string): PreviewConfig {
  console.log('Preparing preview version of the book.');

  const config = prepConfig(srcDir);
  if (!config) return null;
  return Object.assign({}, config, {
    chapters: config?.chapters?.slice(0, 3),
    removeChapters: config?.chapters?.slice(3),
    fullTextUrl,
  });
}

function writeOutput(dir: PathLike, filenames: string[], documents: string[], metadata: BookConfigMetaData): void {
  if (fs.existsSync(dir)) rimraf.sync(dir);
  fs.mkdirSync(dir);

  filenames.forEach((filename, index) => {
    fs.writeFileSync(path.join(dir, filename), documents[index]);
  });

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(metadata, null, 2));
}

function copyFolders(message: string, src: string, out: string, folders: string[], callback: () => void): void {
  console.log(message);

  if (folders && Array.isArray(folders)) {
    const pairs = folders.map(folder => ({
      from: path.join(src, folder),
      to: path.join(out, folder),
    }));

    copyFolder(pairs, callback);
  }
}

function copyFolder(pairs: Pair[], finalCallback: () => void) {
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

async function buildServiceWorker(dir: PathLike, revision: string): Promise<void> {
  console.log('Building service worker…');

  await sw.build(dir, revision).then(code => {
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
