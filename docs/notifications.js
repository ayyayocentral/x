// Initialises firebase
// TODO: fill in firebase config information
var config = {
    apiKey: "AIzaSyADwPTsROOR0JyYiW-f1_6xR1K_bAy1IUI",
    authDomain: "ayyayo-1482088060455.firebaseapp.com",
    databaseURL: "https://ayyayo-1482088060455.firebaseio.com",
    storageBucket: "ayyayo-1482088060455.appspot.com",
    messagingSenderId: "499967151214"
};

firebase.initializeApp(config);

var WebPushManager = function(){
}


WebPushManager.start = function(callback) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./firebase-messaging-sw.js')
            .then(this.getRegistrationId(callback));
    } else {
        callback('Service workers aren\'t supported in this browser.', null);
    }
}

WebPushManager.getRegistrationId = function (callback) {
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {

        var fb_messaging = firebase.messaging();
        fb_messaging.useServiceWorker(serviceWorkerRegistration);

        fb_messaging.requestPermission()
            .then(function() {
                console.log('Notification permission granted.');

                fb_messaging.getToken()
                    .then(function(currentToken) {
                        $.ajax({
                            type: 'POST',
                            url: URLS.API + '/notificationRegistrations',
                            dataType: 'json',
                            data: JSON.stringify({token: currentToken, userId: localStorage.userId || 0}),
                            contentType: 'application/json',
                            success: (data) => {
                                console.log('Success ', data);
                            },
                            error: (err) => {
                                console.log('Error ', err);
                            }
                        })
                        if (currentToken) {
                            callback(null, currentToken);
                        }
                    })
                    .catch(function(err) {
                        callback(err)
                    });
            })
            .catch(function(err) {
                console.log('Unable to get permission to notify. ', err);
                callback(err);
            });
    });
}

WebPushManager.forceNotification = function(message) {
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
        serviceWorkerRegistration.active.postMessage(message);
    });
}

function callback(s){
    console.log('ss',s)
}
WebPushManager.start(callback)