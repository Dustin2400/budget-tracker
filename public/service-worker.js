const CACHE_NAME = 'BudgetTracker';
const DATA_CACHE_NAME = 'Budget_data_cache'
const FILES_TO_CACHE = [
    '/',
    './manifest.json',
    './index.html',
    './css/styles.css',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
    './js/idb.js',
    './js/index.js'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== DATA_CACHE_NAME && key !== CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            )
        })
    )
})



self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => {
                console.log(cache, e.request)
                return fetch(e.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response
                })
                .catch(err => {
                    return cache.match(e.request);
                });
            })
            .catch(err => console.log(err))
        );
        return
    }

    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if(response) {
                    return response;
                } else if (e.request.headers.get('accept').includes('text.html')) {
                    return caches.match('/');
                }
            })
        })
        // caches.match(e.request).then(function (request) {
        //     console.log(request)
        //     if (request) {
        //         console.log('responding with cache : ' + e.request.url)
        //         return request
        //     } else {
        //         console.log('file is not cached, fetching : ' + e.request.url)
        //         return fetch(e.request)
        //     }
        // })
    )
})