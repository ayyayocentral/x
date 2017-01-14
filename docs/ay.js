/**
 * Cannonball Web JavaScript.
 * Romain Huet
 * @romainhuet
 */


(function() {
    /**
     * Initialize Digits for Web as soon as the JavaScript SDK is loaded.
     */
    $('#digits-sdk').load(function () {
        // Initialize Digits using the API key.
        Digits.init({consumerKey: config.digitsConsumerKey})
            .done(function () {
                console.log('Digits initialized.');
            })
            .fail(function () {
                console.log('Digits failed to initialize.');
            });

        // Set a click event listener on the Digits button.
        $('.digits-button').click(onLoginButtonClick);
    });

    /**
     * Launch the Digits login flow.
     */
    function onLoginButtonClick(event) {
        console.log('Digits login started.');
        if (localStorage.m) {
            placeOrder()
        } else {
            Digits.logIn({phoneNumber: '+91'}).done(onLogin).fail(onLoginFailure);
        }

    }

    /**
     * Handle the login once the user has completed the sign in with Digits.
     * We must POST these headers to the server to safely invoke the Digits API
     * and get the logged-in user's data.
     */
    function onLogin(loginResponse) {
        console.log('Digits login succeeded.');
        var oAuthHeaders = parseOAuthHeaders(loginResponse.oauth_echo_headers);

        setDigitsButton('Signing In…');
        $.ajax({
            type: 'POST',
            // url: 'https://api.ayyayo.com/api/digits',
            url: URLS.API + '/users/digits',
            data: oAuthHeaders,
            success: onDigitsSuccess
        });
    }

    /**
     * Handle the login failure.
     */
    function onLoginFailure(loginResponse) {
        console.log('Digits login failed.');
        setDigitsButton('Sign In with Phone');
    }

    /**
     * Handle the login once the user has completed the sign in with Digits.
     * We must POST these headers to the server to safely invoke the Digits API
     * and get the logged-in user's data.
     */
    function onDigitsSuccess(response) {
        console.log('Digits phone number retrieved.')
        if(response.userId){
            localStorage.userId = response.userId;
        }
        setDigitsNumber(response.phoneNumber);
        jQuery.ajax({
            method: 'post',
            url: 'https://es.beatleanalytics.com/ayyayo/users',
            data: JSON.stringify(response),
        })
    }

    /**
     * Parse OAuth Echo Headers:
     * 'X-Verify-Credentials-Authorization'
     * 'X-Auth-Service-Provider'
     */
    function parseOAuthHeaders(oAuthEchoHeaders) {
        var credentials = oAuthEchoHeaders['X-Verify-Credentials-Authorization'];
        var apiUrl = oAuthEchoHeaders['X-Auth-Service-Provider'];

        return {
            apiUrl: apiUrl,
            credentials: credentials
        };
    }

    // Set the Digits button label (and make sure it is not disabled).
    function setDigitsButton(text) {
        $('.digits-button').text(text).removeAttr('disabled');
    }

    // Set the Digits phone number (and disable the button).
    function setDigitsNumber(phoneNumber) {
        localStorage.m = phoneNumber;
        placeOrder(localStorage.text);
        $('.digits-button').text(phoneNumber).attr('disabled', 'disabled');
    }

    var config = {
        digitsConsumerKey: 'Urw1psZRoMCBQ2XAiHO9v5qbW'
    };
    var openx = false;
    var speed = 200;

    function toggle_lng_menu() {
        if (openx) {
            $('#lng_open').slideUp(speed);
            $('.header').removeClass('is-expanded');
        } else {
            $('#lng_open').slideDown(speed);
            $('.header').addClass('is-expanded');
        }
        open = !openx;
    }

    function toggle_menu() {
        $('.page-header__drawer').toggleClass('is-visible');
    }

    function toggle_search() {
        $('.page-subheader--search').slideToggle();
    }

    var coords;

    function render(order) {
        var text = "";
        if (order.lat) {
            text = 'Location :' + order.address + ' Quatity: ' + order.quantity + ' https://maps.google.com/maps?q=' + order.lat + ',' + order.lng + ''
        } else {
            text = 'Location: ' + order.address + ' Quatity: ' + order.quantity
        }
        text += " Contact Number: " + order.deliveryContact;
        return text;
    }

    function placeOrder() {

        var message = "";
        var quantity = $('#quantity').val();
        var address = $('#address').val();

        if (isNaN(quantity) || quantity === "" || quantity === "0" || Number(quantity) < 0) {
            message = 'Pleack check Quatity'
        }

        if (!coords && address === "") {
            message = 'Please check address'
        }
        if (!coords && address.length < 30) {
            message = 'Address requires minimum 30 Characters with Contact Person Name, Address, Pin Landmark'
        }


        if (message !== "") {
            $('#message').text(message);
            $('#message').show();
            return false;
        }
        $('#orderForm button[type="submit"]').prop('disabled', true);
        var order = {};
        if (coords) {
            order = {
                lat: coords.latitude,
                lng: coords.longitude,
                address: coords.address,
                quantity: $('#quantity').val()
            }
        } else {
            order = {
                address: address,
                quantity: quantity,
            }

        }
        order.deliveryContact = $('#deliveryContact').val();

        localStorage.order = JSON.stringify(order);

        text = 'Number: ' + localStorage.m + ' - ' + render(order);


        jQuery.ajax({
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            data: JSON.stringify({text: text}),
            success: function () {
                $('#title').html('Your order placed within 55 Seconds. <br> Our executive will call and confirm the time of delivery. <br>for further any queries Call +91 7892 337 481 for further queries.')
                $('#content').hide();
                $('.after-order').hide();
                localStorage.removeItem('order')
                jQuery.ajax({
                    method: 'post',
                    url: 'https://es.beatleanalytics.com/ayyayo/orders',
                    data: JSON.stringify({text: text, order: order}),
                })
            },
            error: function () {
                $('#title').html('ಅಯ್ಯಯೊ. Something went wrong. Please call +91 7892 337 481 ')
                $('#content').hide();
                $('.after-order').hide();
            }
        })
    }

    $(document).ready(function () {

        if (localStorage.order) {
            order = JSON.parse(localStorage.order);
            $('#quantity').val(order.quantity);
            $('#address').val(order.address);
            $('#deliveryContact').val(order.deliveryContact);

        }

        $('#deliveryContact').val((localStorage.m || '').replace(/[^0-9]/g, ""));
        // La géolocalisation est-elle prise en charge par le navigateur ?
        if (navigator.geolocation) {
            $('#location').html('Searching location using GPS...');
            $('.digits-button').hide();
            navigator.geolocation.getCurrentPosition(showLocation, errorHandler, {
                enableHighAccuracy: false,
                maximumAge: 60000,
                timeout: 27000
            });
        } else {
            $('#address-wrap').show()
        }
    });


// AIzaSyCExDQAvyOO-iiagADLg_fSntgaVWfgAKM
// Fonction de traitement de la position
    function showLocation(position) {
        coords = position.coords;
        $('.digits-button').show();
        jQuery.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coords.latitude + ',' + coords.longitude + '&sensor=true',
            success: function (response) {
                var results = response.results;
                if (response.status === 'OK') {
                    if (results[1]) {
                        $('#location').append('<br>' + results[1].formatted_address);
                        coords.address = results[1].formatted_address;
                    }
                }
            },
        })

        $('#location').show();
        $('#location').html('Location Identified by GPS')
    }

// Fonction de gestion des erreurs
    function errorHandler(error) {
        $('#location').html('');
        // On log l'erreur sans l'afficher, permet simplement de débugger.
        console.log('Geolocation error : code ' + error.code + ' - ' + error.message);
        $('#address-wrap').show()
        $('.digits-button').show();
    }

    var startDate = new Date();
// Do your operations
    var endDate = new Date();
    endDate.setHours(21, 0, 0)
    var count = (endDate.getTime() - startDate.getTime()) / 1000;

    var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

    function timer() {
        count = count - 1;
        if (count <= 0) {
            clearInterval(counter);
            //counter ended, do something here
            return;
        }

        document.getElementById("timer").innerHTML = parseInt(count / 60 / 60) + ' hours ' + parseInt((count / 60) % 60) + " Minutes " + parseInt(count % 60) + " secs";
    }
})()



