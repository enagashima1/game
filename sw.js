const CACHE_NAME = 'tani-game-cache-v1';
// オフラインでも利用できるようにキャッシュするファイル
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon-192x192.png',
  './icon-512x512.png'
];

// PWAのインストール時に実行される
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// fetchイベント（リソースへのリクエスト）が発生したときに実行される
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにファイルがあればそれを返し、なければネットワークから取得する
        return response || fetch(event.request);
      })
  );
});
