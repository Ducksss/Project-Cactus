self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
});

const cacheName = 'js13kPWA-v1';
const appShellFiles = [
    './Project Cactus.svg',
    './index.html',
    './index.bundle.js',
];

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(appShellFiles);
    })());
});