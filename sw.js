/**
 * Service Worker — اختياري
 * يمكّن "تثبيت التطبيق" على Android Chrome ويوفر تخزيناً مؤقتاً بسيطاً.
 * iOS Safari يدعم "إضافة إلى الشاشة الرئيسية" بدون هذا الملف.
 */

const CACHE = 'school-portal-v1';
const ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // استراتيجية: الشبكة أولاً، مع الرجوع للكاش عند انقطاع الاتصال
  // (نتجنب كاش طلبات الـ API)
  const url = new URL(e.request.url);
  const isApi = url.hostname.includes('script.google.com');
  if (isApi || e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
