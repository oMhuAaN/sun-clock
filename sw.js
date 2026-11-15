/* 24 小时太阳钟 · Service Worker */
/* =====================================================
   版本号格式 YYYYMMDD.N：日期为发布当天，N 为当天第几次发布。
   改了页面/样式/逻辑/素材就升版本；跨天日期换当天、N 重置为 1。
   本处 APP_VERSION 必须与 index.html 底部「版本」号保持一致。
   手机端 PWA 检测到版本变化后会自动彻底更新
   （刷新或重开即新版，无需重装、无需删图标）。
   ===================================================== */
const APP_VERSION = "20261019.8";
const CACHE_NAME = "sun-clock-" + APP_VERSION;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/sunrise.jpg",
  "./assets/theme-dawn.jpg",
  "./assets/theme-mint.jpg",
  "./assets/theme-gold.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// 安装：预缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧版本缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 请求：优先网络，失败回退缓存（离线可用）
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
