/* Hello Kitty 治愈工作台 — Service Worker
   离线优先缓存策略 + Kitty 立绘缓存 */

const CACHE_NAME = 'kitty-wb-v3.1.10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/animations.css',
  './css/modules.css',
  './js/db.js',
  './js/supabase.js',
  './js/utils.js',
  './js/components.js',
  './js/app.js',
  './js/sw-register.js',
  './modules/fitness.js',
  './modules/wellness.js',
  './modules/study.js',
  './modules/fortune.js',
  './modules/news.js',
  './modules/bookkeeping.js',
  // PWA 图标
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  // Kitty 立绘（5 大模块主图，多尺寸）
  './assets/img/kitty/kitty-bike-tiny.png',
  './assets/img/kitty/kitty-bike-small.png',
  './assets/img/kitty/kitty-bike-thumb.png',
  './assets/img/kitty/kitty-bike-medium.png',
  './assets/img/kitty/kitty-bike-card.png',
  './assets/img/kitty/kitty-bike-header.png',
  './assets/img/kitty/kitty-bike-hero.png',
  './assets/img/kitty/kitty-bike-hero.webp',
  './assets/img/kitty/kitty-tea-tiny.png',
  './assets/img/kitty/kitty-tea-small.png',
  './assets/img/kitty/kitty-tea-thumb.png',
  './assets/img/kitty/kitty-tea-medium.png',
  './assets/img/kitty/kitty-book-tiny.png',
  './assets/img/kitty/kitty-book-small.png',
  './assets/img/kitty/kitty-book-thumb.png',
  './assets/img/kitty/kitty-book-medium.png',
  './assets/img/kitty/kitty-star-sleep-tiny.png',
  './assets/img/kitty/kitty-star-sleep-small.png',
  './assets/img/kitty/kitty-star-sleep-thumb.png',
  './assets/img/kitty/kitty-star-sleep-medium.png',
  './assets/img/kitty/kitty-cart-tiny.png',
  './assets/img/kitty/kitty-cart-small.png',
  './assets/img/kitty/kitty-cart-thumb.png',
  './assets/img/kitty/kitty-cart-medium.png',
  './assets/img/kitty/kitty-bookkeeping-tiny.png',
  './assets/img/kitty/kitty-bookkeeping-small.png',
  './assets/img/kitty/kitty-bookkeeping-thumb.png',
  './assets/img/kitty/kitty-bookkeeping-medium.png',
  './assets/img/kitty/kitty-bookkeeping-card.png',
  // 通用 hero / 备用
  './assets/img/kitty/kitty-picnic-tiny.png',
  './assets/img/kitty/kitty-picnic-small.png',
  './assets/img/kitty/kitty-picnic-medium.png',
  './assets/img/kitty/kitty-picnic-card.png',
  './assets/img/kitty/kitty-picnic-header.png',
  './assets/img/kitty/kitty-picnic-hero.png',
  './assets/img/kitty/kitty-picnic-hero.webp',
  './assets/img/kitty/kitty-cloud-sleep-tiny.png',
  './assets/img/kitty/kitty-cloud-sleep-small.png',
  './assets/img/kitty/kitty-notebook-tiny.png',
  './assets/img/kitty/kitty-snowglobe-pink-tiny.png',
  './assets/img/kitty/kitty-bag-pink-tiny.png',
  './assets/img/kitty/kitty-airplane-tiny.png',
  './assets/img/kitty/kitty-umbrella-tiny.png',
  './assets/img/kitty/kitty-scooter-tiny.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 脚本 / 网页 / JSON：网络优先（保证每次拿到最新代码，部署即生效，不被旧缓存坑）
// 图片 / 字体：缓存优先（这些资源很少变，离线也好用）
function isFastChanging(request) {
  const url = request.url;
  const path = url.pathname;
  return request.mode === 'navigate' ||
         path.endsWith('.js') ||
         path.endsWith('.html') ||
         path.endsWith('.json') ||
         path.endsWith('.css');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;

  // 跨域请求（如 supabase.co / jsdelivr）一律直连，不进缓存，避免被旧响应误导
  if (new URL(req.url).origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  if (isFastChanging(req)) {
    // 网络优先 + 后台回填缓存
    event.respondWith(
      fetch(req).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(req).then((cached) => {
          return cached || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error());
        });
      })
    );
    return;
  }

  // 图片等：缓存优先 + 后台更新
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        fetch(req).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(req, response));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return response;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
