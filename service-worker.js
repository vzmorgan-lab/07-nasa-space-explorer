const CACHE_NAME = "nasa-space-explorer-v4";
const API_CACHE_NAME = "nasa-space-explorer-api-v1";
const API_ORIGIN = "https://api.nasa.gov";
const API_PATH = "/planetary/apod";
const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css?v=3",
    "./js/dateRange.js?v=2",
    "./js/script.js?v=3",
    "./img/NASA-Logo-Large.png",
    "./img/NASA-background.jpeg",
    "./img/blue-NASA.jpeg",
    "./img/app-icon-192.png",
    "./img/app-icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName =>
                        cacheName.startsWith("nasa-space-explorer-") &&
                        cacheName !== CACHE_NAME &&
                        cacheName !== API_CACHE_NAME
                    )
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const requestURL = new URL(request.url);

    if (
        request.method === "GET" &&
        requestURL.origin === API_ORIGIN &&
        requestURL.pathname === API_PATH
    ) {
        event.respondWith(
            caches.open(API_CACHE_NAME)
                .then(cache => fetch(request)
                    .then(response => {
                        if (!response.ok) {
                            return response;
                        }

                        return cache.put(request, response.clone())
                            .then(() => response);
                    })
                    .catch(error => cache.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }

                            throw error;
                        })
                    )
                )
        );
        return;
    }

    if (request.method !== "GET" || requestURL.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request, { ignoreSearch: true })
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).catch(error => {
                    if (request.mode === "navigate") {
                        return caches.match("./index.html")
                            .then(offlinePage => {
                                if (offlinePage) {
                                    return offlinePage;
                                }

                                throw error;
                            });
                    }

                    throw error;
                });
            })
    );
});
