/**
 * Created by Manjesh on 14-01-2017.
 */
angular.module('uiGenApp')
  .config($stateProvider => {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'app/routes/home/home.html',
        controller: 'HomeCtrl',
        controllerAs: '$ctrl',
      })
  })
  .controller('HomeCtrl', function() {

  });