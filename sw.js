const CACHE_NAME = 'unitess-gallery-v3';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './image.png'
];

self.addEventListener('install', event => {
    // 사용자가 화면을 닫지 않아도 즉시 새 버전의 서비스워커가 제어권을 갖도록 강제 적용 (F5 필요없음)
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    // 설치되자마자 즉시 모든 클라이언트(열려있는 앱)에 대해 제어권을 갖도록 함
    event.waitUntil(clients.claim());

    // 구버전 캐시 완전히 삭제 (새로고침 없이도 꼬이지 않도록)
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // [강력 추천 방식: Network First] 
    // 항상 무조건 최신 서버(네트워크)에서 가져오기를 먼저 시도하고, 
    // 인터넷이 끊겼을 때만(오프라인) 예전 캐시를 보여줍니다.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 네트워크 성공 시 최신 파일로 즉시 캐시 갈아끼우기
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // 오프라인이거나 에러가 났을 때만 캐시를 꺼내 보여줌
                return caches.match(event.request);
            })
    );
});
