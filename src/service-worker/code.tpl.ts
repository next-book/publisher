/**
 * Service worker
 * @module
 */
/// <reference lib="WebWorker" />
import 'regenerator-runtime';
import {
  iso,
  GetMetadataAPI,
  GetActivatedAtAPI,
  GetOldCacheDeletedAtAPI,
  DeleteOldCacheAPI,
  GetCacheDeletedAtAPI,
  GetCacheExistsAPI,
  DeleteCacheAPI,
  UpdateCacheAPI,
  GetCacheUpdatedAtAPI,
  GetIgnoredCacheAPI,
  SetIgnoreCacheAPI,
} from '../../shared/service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

const CACHE = 'cache-%revision%';

interface Keyval<Key, Value> {
  key: Key;
  value?: Value;
}

type IdbOldCacheDeletedAt = Keyval<'oldCacheDeletedAt', iso>;
type IdbCacheDeletedAt = Keyval<'cacheDeletedAt', iso>;
type IdbCacheUpdatedAt = Keyval<'cacheUpdatedAt', iso>;
type IdbActivatedAt = Keyval<'activatedAt', iso>;
type IdbIgnoreCache = Keyval<'ignoreCache', boolean>;

/**
 * A keyval schema used in {@link idb} IndexedDB wrapper
 */
type Schema =
  | IdbOldCacheDeletedAt
  | IdbCacheDeletedAt
  | IdbCacheUpdatedAt
  | IdbActivatedAt
  | IdbIgnoreCache;

// Service worker messages API

/**
 * Helper structure to access type parameters
 */
interface APIstructure {
  req: any;
  res: any;
}

/**
 * A function used to resolve custom service worker API message.
 *
 * @remarks
 * A resolver takes request and result types, which are then
 * used to typecheck resolver implementation.
 */
type Resolver<A extends APIstructure> = (e: A['req']) => Promise<A['res']>;

/**
 * An service worker API resolver map
 */
interface Resolvers {
  getMetadata: Resolver<GetMetadataAPI>;
  getActivatedAt: Resolver<GetActivatedAtAPI>;
  getOldCacheDeletedAt: Resolver<GetOldCacheDeletedAtAPI>;
  deleteOldCache: Resolver<DeleteOldCacheAPI>;
  getCacheDeletedAt: Resolver<GetCacheDeletedAtAPI>;
  getCacheExists: Resolver<GetCacheExistsAPI>;
  deleteCache: Resolver<DeleteCacheAPI>;
  updateCache: Resolver<UpdateCacheAPI>;
  getCacheUpdatedAt: Resolver<GetCacheUpdatedAtAPI>;
  getIgnoreCache: Resolver<GetIgnoredCacheAPI>;
  setIgnoreCache: Resolver<SetIgnoreCacheAPI>;
}

type APIs =
  | GetMetadataAPI
  | GetActivatedAtAPI
  | GetOldCacheDeletedAtAPI
  | DeleteOldCacheAPI
  | GetCacheDeletedAtAPI
  | GetCacheExistsAPI
  | DeleteCacheAPI
  | UpdateCacheAPI
  | GetCacheUpdatedAtAPI
  | GetIgnoredCacheAPI
  | SetIgnoreCacheAPI;

/**
 * Service worker message event with supported requests
 */
interface MessageEvent extends ExtendableMessageEvent {
  data: APIs['req'];
}

/**
 * IndexedDB singleton wrapper used to store persistent information with an predefined {@link Schema}
 */
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

const success = <T>(
  data: T
): {
  success: true;
  data: T;
} => ({
  success: true,
  data: data,
});

const error = (
  error: string
): {
  success: false;
  error: Error;
} => ({
  success: false,
  error: new Error(error),
});

// try catch could be done on the callers side
const resolvers: Resolvers = {
  getMetadata: async () => {
    try {
      return success({
        activatedAt: await idb.get<IdbActivatedAt>('activatedAt'),
        cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
        cacheUpdatedAt: await idb.get<IdbCacheUpdatedAt>('cacheUpdatedAt'),
        oldCacheDeletedAt: await idb.get<IdbOldCacheDeletedAt>('oldCacheDeletedAt'),
        ignoreCache: (await idb.get<IdbIgnoreCache>('ignoreCache')) || false,
        cacheExists: await caches.has(CACHE),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  getOldCacheDeletedAt: async () => {
    try {
      return success({
        oldCacheDeletedAt: await idb.get<IdbOldCacheDeletedAt>('oldCacheDeletedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  getCacheDeletedAt: async () => {
    try {
      return success({
        cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  setIgnoreCache: async e => {
    try {
      await idb.set({ key: 'ignoreCache', value: e.payload.value });
      return success({
        ignoreCache: e.payload.value,
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  getIgnoreCache: async () => {
    try {
      return success({
        ignoreCache: (await idb.get<IdbIgnoreCache>('ignoreCache')) || false,
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  getActivatedAt: async () => {
    try {
      return success({
        activatedAt: await idb.get<IdbActivatedAt>('activatedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  deleteOldCache: async () => {
    try {
      await deleteOldCache('deleteOldCache');
      return success({
        oldCacheDeletedAt: await idb.get<IdbOldCacheDeletedAt>('oldCacheDeletedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  deleteCache: async () => {
    try {
      if (!(await caches.delete(CACHE))) {
        throw Error('Cache does not exist.');
      }
      await setCacheDeletedAt();
      return success({
        cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  updateCache: async () => {
    try {
      if (await caches.delete(CACHE)) {
        await setCacheDeletedAt();
      }
      await cache('updateCache');
      return success({
        cacheDeletedAt: await idb.get<IdbCacheDeletedAt>('cacheDeletedAt'),
        cacheUpdatedAt: await idb.get<IdbCacheUpdatedAt>('cacheUpdatedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  getCacheUpdatedAt: async () => {
    try {
      return success({
        cacheUpdatedAt: await idb.get<IdbCacheUpdatedAt>('cacheUpdatedAt'),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
  getCacheExists: async () => {
    try {
      return success({
        cacheExists: await caches.has(CACHE),
      });
    } catch (e: any) {
      return error(e.message);
    }
  },
};

async function handleMessage(e: MessageEvent) {
  console.log('[message router] Recieved message:', e.data.message);
  // check event.origin for added security
  if (!e.data?.message) {
    postMessage({ success: false, error: 'Message not provided.' });
    return;
  }
  if (resolvers.hasOwnProperty(e.data.message)) {
    const data = await resolvers[e.data.message](e.data as never);
    postMessage(data);
    return;
  }
  postMessage({ success: false, error: 'Resolver does not exist.' });
  return;
}

function postMessage(data: any) {
  sw.clients
    .matchAll({
      includeUncontrolled: true,
    })
    .then(clientList => {
      clientList.forEach(function (client) {
        client.postMessage(data);
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

sw.addEventListener('install', handleInstall);
sw.addEventListener('activate', handleActivate);
sw.addEventListener('fetch', handleFetch);
sw.addEventListener('message', handleMessage);
