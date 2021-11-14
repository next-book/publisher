/// <reference lib="WebWorker" />
import 'regenerator-runtime';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

const CACHE = 'cache-%revision%';

type iso = string;

type Schema =
  | {
      key: 'cacheDeletedAt';
      value: iso;
    }
  | {
      key: 'activatedAt';
      value: iso;
    };

// followed messages are supported by service worker
// usage: navigator.serviceWorker.controller.postMessage(message);
export type Message = 'getServiceWorkerMetadata' | 'getCacheDeletedAt' | 'getActivatedAt';

type ResultData =
  | {
      activatedAt?: iso;
      cacheDeletedAt?: iso;
    }
  | iso
  | undefined;

type ResultSuccess<ResultData> = { success: true; data?: ResultData };
type ResultError = { success: false; error: Error };

// type that may be used in interface, it can be modified later
export type Result<ResultData> = ResultSuccess<ResultData> | ResultError;

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
    async get(key: Schema['key']) {
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
  e.waitUntil(
    caches
      .open(CACHE)
      .then(cache => {
        console.log('[install] Opened cache');
        return cache.addAll('%assets%');
      })
      .then(() => {
        console.log(
          '[install] All required resources have been cached;',
          'the Service Worker was successfully installed'
        );
        return sw.skipWaiting();
      })
  );
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
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE) {
              console.log('[activate] Deleting old cache:', cacheName);
              return caches
                .delete(cacheName)
                .then(() => idb.set({ key: 'cacheDeletedAt', value: new Date().toISOString() }));
            }
            return null;
          })
        )
      )
      .then(() => {
        console.log('[activate] Claiming clients for version', CACHE);
        return sw.clients.claim();
      })
      .then(() => idb.set({ key: 'activatedAt', value: new Date().toISOString() }))
  );
}

function handleFetch(e: FetchEvent) {
  e.respondWith(
    caches.open(CACHE).then(cache => {
      return cache.match(e.request).then(matching => {
        if (matching) {
          console.log('[fetch] Serving file from cache: ', e.request.url);
          return matching;
        }
        return fetch(e.request);
      });
    })
  );
}

interface MessageEvent extends ExtendableMessageEvent {
  data: Message;
}

async function handleMessage(e: MessageEvent) {
  console.log('[message router] Recieved message:', e.data);
  // check event.origin for added security
  switch (e.data) {
    case 'getServiceWorkerMetadata':
      postMessage({
        activatedAt: await idb.get('activatedAt'),
        cacheDeletedAt: await idb.get('cacheDeletedAt'),
      });
      break;
    case 'getCacheDeletedAt':
      postMessage({
        cacheDeletedAt: await idb.get('cacheDeletedAt'),
      });
      break;
    case 'getActivatedAt':
      postMessage({
        activatedAt: await idb.get('activatedAt'),
      });
      break;
    default:
      postMessage();
  }
}

function postMessage(data?: ResultData) {
  sw.clients
    .matchAll({
      includeUncontrolled: true,
    })
    .then(clientList => {
      clientList.forEach(function (client) {
        if (!data)
          client.postMessage({
            success: false,
            error: new Error('Message not allowed.'),
          });
        else
          client.postMessage({
            success: true,
            data: data,
          });
      });
    });
}

sw.addEventListener('install', handleInstall);
sw.addEventListener('activate', handleActivate);
sw.addEventListener('fetch', handleFetch);
sw.addEventListener('message', handleMessage);
