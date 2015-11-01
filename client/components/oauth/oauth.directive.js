'use strict';

var app = angular.module('ticTacToeApp');

app.directive('oauthButtons', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'components/oauth/oauth.html',
    controller: function($scope, $window) {
      $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
      };
    }
  };
});
