'use strict';

console.log('Started', self);

self.addEventListener('install', function(event) {
    self.skipWaiting();
    console.log('Installed', event);
});

self.addEventListener('activate', function(event) {
    console.log('Activated', event);
});

self.addEventListener('push', function(event) {
    console.log('Push message received', event);
    var msg = event.data ? event.data.json() : {};
    console.log(msg);
    var title = msg.title || 'HUGVR';
    event.waitUntil(
        self.registration.showNotification(title, {
            body: msg.body || '',
            icon: 'images/icon.png',
            tag: 'example-tag',
            vibrate: [200, 200],
            data: {url: msg.url}
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('Notification click: tag ', event.notification.tag);
    event.notification.close();
    var url = event.notification.data.url || 'http://syumai.com';
    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
            .then(function(windowClients) {
                var isFocused  = false;
                windowClients.forEach(function(client) {
                    if(client.url.indexOf(url) >= 0 && client.focus) {
                        client.focus();
                        isFocused = true;
                    }
                });
                if(!isFocused && clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
