'use strict';

var reg, sub;
var isSubscribed = false;
var subscribeButton = document.getElementById('button');
var endpointContainer = document.getElementById('endpoint');

if(navigator.serviceWorker) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('./sw.js').then(function() {
        return navigator.serviceWorker.ready;
    })
        .then(function(serviceWorkerRegistration) {
            reg = serviceWorkerRegistration;
            subscribeButton.disabled = false;
            console.log('Service worker is ready', reg);
        })
        .catch(function(err) {
            console.log('Service worker error', err);
        });
}

subscribeButton.addEventListener('click', function() {
    if(isSubscribed) {
        unsubscribe();
    } else {
        subscribe();
    }
});

function subscribe() {
    reg.pushManager.subscribe({userVisibleOnly: true})
        .then(function(pushSubscription) {
            sub = pushSubscription;
            console.log('Subscribed! Endpoint:', sub.endpoint);
            console.log(JSON.stringify(sub));
            endpointContainer.textContent = "'" + JSON.stringify(sub) + "'";
            subscribeButton.textContent = 'Unsubscribe';
            isSubscribed = true;
        });
}

function unsubscribe() {
    sub.unsubscribe().then(function(event) {
        subscribeButton.textContent = 'Subscribe';
        console.log('Unsubscribed!', event);
        isSubscribed = false;
    }).catch(function(err) {
        console.log('Error unsubscribing', err);
        subscribeButton.textContent = 'Subscribe';
    });
}
