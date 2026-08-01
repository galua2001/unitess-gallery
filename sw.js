self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        self.registration.unregister()
            .then(function() {
                return self.clients.matchAll();
            })
            .then(function(clients) {
                clients.forEach(client => {
                    if (client.url) {
                        client.navigate(client.url);
                    }
                });
            })
    );
});
