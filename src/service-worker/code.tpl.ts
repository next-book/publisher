/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

const CACHE = 'cache-%revision%';

function handleInstall(e: ExtendableEvent) {
  console.log('[install] Kicking off service worker registration');
  e.waitUntil(caches.open(CACHE)
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

  e.waitUntil(caches
    .keys()
    .then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE) {
            console.log('[activate] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    )
    .then(() => {
      console.log('[activate] Claiming clients for version', CACHE);
      return sw.clients.claim();
    })
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

sw.addEventListener('install', handleInstall);
sw.addEventListener('activate', handleActivate); 
sw.addEventListener('fetch', handleFetch);
