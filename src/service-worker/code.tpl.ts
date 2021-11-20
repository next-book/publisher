/**
 * Service worker
 * @module
 */
/// <reference lib="WebWorker" />
import 'regenerator-runtime';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

const CACHE = 'cache-%revision%';

type iso = string;

interface Keyval<Key, Value> {
  key: Key;
  value?: Value;
}

type IdbOldCacheDeletedAt = Keyval<'oldCacheDeletedAt', iso>;
type IdbCacheDeletedAt = Keyval<'cacheDeletedAt', iso>;
type IdbCacheUpdatedAt = Keyval<'cacheUpdatedAt', iso>;
type IdbActivatedAt = Keyval<'activatedAt', iso>;
type IdbIgnoreCache = Keyval<'ignoreCache', boolean>;

// IndexedDB keyval schema
type Schema =
  | IdbOldCacheDeletedAt
  | IdbCacheDeletedAt
  | IdbCacheUpdatedAt
  | IdbActivatedAt
  | IdbIgnoreCache;

// Service worker messages API
type ResultSuccess<T> = { success: true; data?: T };
type ResultError = { success: false; error: Error };
type Result<T> = ResultSuccess<T> | ResultError;
type SwAPI<Request, ResultData> = {
  req: Request;
  res: Result<ResultData>;
};

interface ResultData {
  error?: string;
}

interface Metadata extends ResultData {
  activatedAt?: iso;
  cacheDeletedAt?: iso;
  oldCacheDeletedAt?: iso;
  cacheUpdatedAt?: iso;
  ignoreCache: boolean;
  cacheExists: boolean;
}

interface ActivatedAt extends ResultData {
  activatedAt?: iso;
}

interface OldCacheDeletedAt extends ResultData {
  oldCacheDeletedAt?: iso;
}

interface CacheDeletedAt extends ResultData {
  cacheDeletedAt?: iso;
}

interface CacheUpdatedAt extends ResultData {
  cacheUpdatedAt?: iso;
}

type CacheDeletedAndUpdatedAt = CacheUpdatedAt & CacheDeletedAt;

interface IgnoreCache extends ResultData {
  ignoreCache: boolean;
}

interface CacheExists extends ResultData {
  cacheExists: boolean;
}

export type MetadataAPI = SwAPI<{ message: 'getMetadata' }, Metadata>;
export type ActivatedAtAPI = SwAPI<{ message: 'getActivatedAt' }, ActivatedAt>;

export type OldCacheDeletedAtAPI = SwAPI<{ message: 'getOldCacheDeletedAt' }, OldCacheDeletedAt>;
export type DeleteOldCacheAPI = SwAPI<{ message: 'deleteOldCache' }, OldCacheDeletedAt>;

export type CacheDeletedAtAPI = SwAPI<{ message: 'getCacheDeletedAt' }, CacheDeletedAt>;
export type GetCacheExists = SwAPI<{ message: 'getCacheExists' }, CacheExists>;
export type DeleteCacheAPI = SwAPI<{ message: 'deleteCache' }, CacheDeletedAt>;

export type UpdateCacheAPI = SwAPI<{ message: 'updateCache' }, CacheDeletedAndUpdatedAt>;
export type CacheUpdatedAtAPI = SwAPI<{ message: 'getCacheUpdatedAt' }, CacheUpdatedAt>;

export type GetIgnoredCacheAPI = SwAPI<{ message: 'getIgnoreCache' }, IgnoreCache>;
export type SetIgnoreCacheAPI = SwAPI<{ message: 'setIgnoreCache'; value: boolean }, IgnoreCache>;

type APIs =
  | MetadataAPI
  | ActivatedAtAPI
  | OldCacheDeletedAtAPI
  | DeleteOldCacheAPI
  | CacheDeletedAtAPI
  | GetCacheExists
  | DeleteCacheAPI
  | UpdateCacheAPI
  | CacheUpdatedAtAPI
  | GetIgnoredCacheAPI
  | SetIgnoreCacheAPI;

// supported messages by service worker
// usage: navigator.serviceWorker.controller.postMessage(message);
type IncomingData = APIs['req'];

// IndexedDB singleton wrapper
const idb = (() => {
  let dbInstance: Promise<IDBDatabase>;

  function getDB() {
    if (!dbInstance) {
      dbInstance = new Promise((resolve, reject) => {
        const openreq = indexedDB.open('nb-keyval', 1);

        openreq.onerror = () => {
          reject(openreq.error);
        };

        openreq.onupgradeneeded = () => {
          // first time setup
          openreq.result.createObjectStore('meta');
        };

        openreq.onsuccess = () => {
          resolve(openreq.result);
        };
      });
    }
    return dbInstance;
  }

  async function withStore(
    type: IDBTransactionMode | undefined,
    callback: (store: IDBObjectStore) => void
  ) {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('meta', type);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      callback(transaction.objectStore('meta'));
    });
  }
  return {
    async get<K extends Schema>(key: K['key']): Promise<K['value']> {
      let request: IDBRequest<any> | undefined;
      await withStore('readonly', store => {
        request = store.get(key);
      });
      return request?.result;
    },
    set(data: Schema) {
      return withStore('readwrite', store => {
        store.put(data.value, data.key);
      });
    },
    delete(key: Schema['key']) {
      return withStore('readwrite', store => {
        store.delete(key);
      });
    },
  };
})();

function handleInstall(e: ExtendableEvent) {
  console.log('[install] Kicking off service worker registration');
  e.waitUntil(cache('install').then(() => sw.skipWaiting()));
}

function handleActivate(e: ExtendableEvent) {
  console.log('[activate] Activating service worker');

  sw.clients
    .matchAll({
      includeUncontrolled: true,
    })
    .then(clientList => {
      const urls = clientList.map(client => client.url);
      console.log('[activate] Matching clients:', urls.join(', '));
    });

  e.waitUntil(
    deleteOldCache('activate')
      .then(() => {
        console.log('[activate] Claiming clients for version', CACHE);
        return sw.clients.claim();
      })
      .then(() => idb.set({ key: 'activatedAt', value: new Date().toISOString() }))
  );
}

function handleFetch(e: FetchEvent) {
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const ignoreCache = (await idb.get<IdbIgnoreCache>('ignoreCache')) || false;
      return cache.match(e.request).then(matching => {
        if (matching && !ignoreCache) {
          console.log('[fetch] Serving file from cache: ', e.request.url);
          return matching;
        }
        console.log('[fetch] Fetching file: ', e.request.url);
        return fetch(e.request);
      });
    })
  );
}

interface MessageEvent extends ExtendableMessageEvent {
  data: IncomingData;
}

async function handleMessage(e: MessageEvent) {
  console.log('[message router] Recieved message:', e.data);
  // check event.origin for added security

  switch (e.data?.message) {
    case 'getMetadata':
      postRes<Metadata>({
        activatedAt: await idb.get<IdbActivatedAt>('activatedAt'),
        cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
        cacheUpdatedAt: await idb.get<IdbCacheUpdatedAt>('cacheUpdatedAt'),
        oldCacheDeletedAt: await idb.get<IdbOldCacheDeletedAt>('oldCacheDeletedAt'),
        ignoreCache: (await idb.get<IdbIgnoreCache>('ignoreCache')) || false,
        cacheExists: await caches.has(CACHE),
      });
      break;
    case 'getOldCacheDeletedAt':
      postRes<OldCacheDeletedAt>({
        oldCacheDeletedAt: await idb.get<IdbOldCacheDeletedAt>('oldCacheDeletedAt'),
      });
      break;
    case 'getCacheDeletedAt':
      postCacheDeleteAt();
      break;
    case 'setIgnoreCache':
      await idb
        .set({ key: 'ignoreCache', value: e.data?.value })
        .catch(_e => postRes({ error: 'Setting ignoreCache failed.' }));
      postRes<IgnoreCache>({
        ignoreCache: e.data.value,
      });
      break;
    case 'getIgnoreCache':
      postRes<IgnoreCache>({
        ignoreCache: (await idb.get<IdbIgnoreCache>('ignoreCache')) || false,
      });
      break;
    case 'getActivatedAt':
      postRes<ActivatedAt>({
        activatedAt: await idb.get<IdbActivatedAt>('activatedAt'),
      });
      break;
    case 'deleteOldCache':
      await deleteOldCache('deleteOldCache');
      postRes<OldCacheDeletedAt>({
        oldCacheDeletedAt: await idb.get<IdbOldCacheDeletedAt>('oldCacheDeletedAt'),
      });
      break;
    case 'deleteCache':
      if (!(await caches.delete(CACHE))) {
        postRes({ error: 'Cache does not exist.' });
        break;
      }
      await setCacheDeletedAt();
      postCacheDeleteAt();
      break;
    case 'updateCache':
      if (await caches.delete(CACHE)) {
        await setCacheDeletedAt();
      }
      await cache('updateCache');
      postRes<CacheDeletedAndUpdatedAt>({
        cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
        cacheUpdatedAt: await idb.get<IdbCacheUpdatedAt>('cacheUpdatedAt'),
      });
      break;
    case 'getCacheUpdatedAt':
      postRes<CacheUpdatedAt>({
        cacheUpdatedAt: await idb.get<IdbCacheUpdatedAt>('cacheUpdatedAt'),
      });
      break;
    case 'getCacheExists':
      postRes<CacheExists>({
        cacheExists: await caches.has(CACHE),
      });
      break;
    default:
      postRes({ error: 'Message not allowed.' });
  }
}

function postRes<T extends ResultData>(data?: T) {
  let result: Result<T>;
  if (data?.error)
    result = {
      success: false,
      error: new Error(data.error),
    };
  else
    result = {
      success: true,
      data: data,
    };
  sw.clients
    .matchAll({
      includeUncontrolled: true,
    })
    .then(clientList => {
      clientList.forEach(function (client) {
        client.postMessage(result);
      });
    });
}

async function cache(context: 'install' | 'updateCache') {
  return caches
    .open(CACHE)
    .then(cache => {
      console.log('[' + context + '] Opened cache');
      return cache.addAll('%assets%');
    })
    .then(() => idb.set({ key: 'cacheUpdatedAt', value: new Date().toISOString() }))
    .then(() => {
      console.log('[' + context + '] All required resources have been cached;');
      if (context === 'install') {
        console.log('the Service Worker was successfully installed');
      }
    });
}

async function deleteOldCache(context: 'activate' | 'deleteOldCache') {
  return caches
    .keys()
    .then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE) {
            console.log('[' + context + '] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    )
    .then(async () => idb.set({ key: 'oldCacheDeletedAt', value: new Date().toISOString() }));
}

async function setCacheDeletedAt() {
  await idb.set({ key: 'cacheDeletedAt', value: new Date().toISOString() });
}

async function postCacheDeleteAt() {
  postRes<CacheDeletedAt>({
    cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
  });
}

sw.addEventListener('install', handleInstall);
sw.addEventListener('activate', handleActivate);
sw.addEventListener('fetch', handleFetch);
sw.addEventListener('message', handleMessage);
