angular.module('uiGenApp', [
    'ui.router',
    'angular-loading-bar'
  ])
  .config(($urlRouterProvider, $locationProvider) => {
    $urlRouterProvider.when('/', '/home');
    $urlRouterProvider.otherwise('/home');
    $locationProvider.html5Mode(true);
  }).run(($sce) => {

  })
  .constant('AUTH_EVENTS', {
    loginConfirmed: 'event:auth-loginConfirmed',
    loginCancelled: 'event:auth-loginCancelled',
    logoutConfirmed: 'event:auth-logoutConfirmed',
    loginRequired: 'event:auth-loginRequired',
    forbidden: 'event:auth-forbidden',
  })
  .constant('URLS', URLS)
  .factory('Session', [
    '$window',
    function Session($window) {
      const sessionService = {};

      sessionService.create = function create(key, value) {
        $window.localStorage[key] = angular.toJson(value);
      };

      sessionService.read = function read(key) {
        return angular.fromJson($window.localStorage[key]);
      };

      sessionService.destroy = function destroy() {
        $window.localStorage.clear();
      };

      sessionService.isAuthenticated = function isAuthenticated() {
        return !!(sessionService.read('oauth') && sessionService.read('oauth').access_token);
      };

      sessionService.getAccessToken = function getAccessToken() {
        return sessionService.read('oauth') && sessionService.read('oauth').access_token;
      };

      sessionService.isAuthorized = function isAuthorized(authorizedRoles) {
        let roles = authorizedRoles;
        if (!angular.isArray(roles)) {
          roles = [].push(roles);
        }

        return (sessionService.isAuthenticated() && ~roles.indexOf(sessionService.userRole));
      };

      return sessionService;
    },
  ])
.factory('Auth',
    function Auth($log, $http, $q, Session, URLS) {
      const authService = {};
      let refreshingToken = false;

      authService.login = function login(credentials) {
        const url = `${URLS.PARTNER_OAUTH_API}/login`;
        return $http
          .post(url, credentials, { ignoreAuthModule: true })
          .then(response => Session.create('oauth', response.data))
          .catch(
            res => {
              Session.destroy();
              return $q.reject(res.data);
            });
      };

      authService.refreshToken = () => {
        // To Save Multiple Async RefreshToken Request
        if (refreshingToken) {
          $log.warn('Refresh token request already sent.');
          return $q.reject({ warning: 'Refresh token request already sent.' });
        }
        refreshingToken = true; // Set refresh_token reuqest tracker flag
        const url = `${URLS.PARTNER_OAUTH_API}/refresh`;
        return $http
          .post(
            url,
            { refresh_token: Session.read('oauth').refresh_token },
            { ignoreAuthModule: true }
          )
          .then(res => {
            Session.create('oauth', res.data);
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.resolve(res);
          }).catch(res => {
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.reject(res);
          });
      };

      authService.logout = function logout() {
        const url = `${URLS.PARTNER_OAUTH_API}/logout`;
        return $http
          .post(url, { access_token: Session.getAccessToken() })
          .then(
            response => {
              // Destroy Session data
              Session.destroy();
              return response.data;
            },
            err => {
              Session.destroy();
              return $q.reject(err.data);
            }
          );
      };

      authService.setSessionData = () => {
        return $q.all([
          $http
            .get(`${URLS.QUARC_API}/users/me`)
            .then(response => Session.create('userinfo', response.data)),
          $http
            .get(`${URLS.QUARC_API}/users/states`)
            .then(response => Session.create('states', response.data)),
        ]);
      }

      return authService;
    })
  .factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS, Session, $injector, URLS) {
    return {
      request(config) {
        if (Session.isAuthenticated()) {
          config.headers.Authorization = `Bearer ${Session.getAccessToken()}`;
        }
        if (config.url[0] === '/') config.url = `${URLS.QUARC_API}${config.url}`;
        return config;
      },
    };
  })
  // this configs to initiated using provider
  .config(function ($httpProvider) { $httpProvider.interceptors.push('AuthInterceptor'); })
  .directive('foot', function() {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      link: function(scope, element) {
        element.addClass('footer');
      }
    };
  })
  .directive('navbar', function() {
    return {
      templateUrl: 'components/navbar/navbar.html',
      replace: false,
      restrict: 'E',
      controller: 'NavbarController',
      controllerAs: '$ctrl',
    };
  })
  .controller('NavbarController', function(){

  })
  .controller('AppController', function(  ) {

  })