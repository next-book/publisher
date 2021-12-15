import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';
import rimraf from 'rimraf';
import copy from 'recursive-copy';
import * as sw from './service-worker/builder';
import Manifest from '../shared/manifest';
import { PartialConfig, previewDefaults, Preview } from './config';
import { PathLike } from './utils/fs';

type PrepContent = {
  content: string[];
  filenames: string[];
};

type Pair = { from: string; to: string };

export function prepContent(
  srcDir: PathLike,
  filter: string,
  previewRemovals: string[]
): PrepContent {
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

/**
 * @example We have guaranteed that config contains Preview info,
 * once we add user preview options applied onto defaults.
 */
export interface PartialConfigWithPreview extends PartialConfig {
  preview: Preview;
}

/**
 * Reads book config options from file
 * @param srcDir
 * @param fullTextUrl
 * @returns
 */
export function prepConfig(
  srcDir: PathLike,
  fullTextUrl?: string
): PartialConfigWithPreview | null {
  const configPath = path.join(srcDir, '/book.json');
  console.log(`Looking up a custom book config in "${configPath}/".`);

  const partialConfig: PartialConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : null;

  // rename depricated `chapters` property
  if (partialConfig.chapters && !partialConfig.readingOrder) {
    partialConfig.readingOrder = [...partialConfig.chapters];
    delete partialConfig.chapters;
  }

  // overriden preview config defaults with custom options
  const preview: Preview = { ...previewDefaults, ...partialConfig.preview };

  if (fullTextUrl) {
    preview.isPreview = true;
    preview.fullTextUrl = fullTextUrl;
  }

  const config: PartialConfigWithPreview = { ...partialConfig, preview: { ...preview } };

  if (preview.isPreview && preview.fullTextUrl) {
    console.log('Preparing preview version of the book.');
    config.readingOrder = partialConfig.readingOrder?.slice(0, preview.chaptersSlice);
    if (partialConfig.readingOrder)
      config.preview.removeChapters = partialConfig.readingOrder.slice(preview.chaptersSlice);
  }

  console.log(config ? 'Found custom book config.' : 'Custom book config not found.');
  return config;
}

export function writeOutput(
  dir: PathLike,
  filenames: string[],
  documents: (string | JSDOM)[],
  manifest: Manifest
): void {
  if (fs.existsSync(dir)) rimraf.sync(dir);
  fs.mkdirSync(dir);

  filenames.forEach((filename, index) => {
    if (typeof documents[index] === 'string') {
      fs.writeFileSync(path.join(dir, filename), documents[index] as string);
    } else {
      fs.writeFileSync(path.join(dir, filename), documents[index].toString());
    }
  });

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

export function copyFolders(
  message: string,
  src: string,
  out: string,
  folders: string[],
  callback: () => void
): void {
  console.log(message);

  if (folders && Array.isArray(folders)) {
    const pairs = folders.map(folder => ({
      from: path.join(src, folder),
      to: path.join(out, folder),
    }));

    copyFolder(pairs, callback);
  }
}

export function copyFolder(pairs: Pair[], finalCallback: () => void): void {
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
